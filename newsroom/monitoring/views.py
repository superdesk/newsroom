import flask
from bson import ObjectId
from flask import jsonify, current_app as app, send_file
from flask_babel import gettext
from superdesk import get_resource_service
from werkzeug.exceptions import NotFound
from eve.methods.get import get_internal
from eve.render import send_response
from newsroom.decorator import admin_only, login_required, account_manager_only
from newsroom.companies import section
from newsroom.monitoring import blueprint
from .forms import MonitoringForm, alert_types
from newsroom.utils import query_resource, find_one, get_items_by_id, get_entity_or_404, get_json_or_400, \
    set_original_creator, set_version_creator, is_json_request, get_items_for_user_action
from newsroom.companies import clean_company
from newsroom.template_filters import is_admin
from newsroom.auth import get_user, get_user_id
from newsroom.wire.utils import update_action_list
from newsroom.wire.views import item as wire_print
from newsroom.notifications import push_user_notification
from newsroom.wire.search import get_bookmarks_count
from newsroom.monitoring.utils import get_date_items_dict, get_monitoring_file, \
    get_items_for_monitoring_report, DELAYED_INTERVALS, IMMEDIATE_INTERVAL, SCHEDULE_DAYS
from superdesk.logging import logger
from newsroom.email import send_email
import base64
import re


def get_view_data():
    user = get_user()
    return {
        'user': str(user['_id']) if user else None,
        'company': str(user['company']) if user and user.get('company') else None,
        'navigations': get_monitoring_for_company(user),
        'context': 'monitoring',
        'groups': app.config.get('MONITORING_GROUPS') or app.config.get('WIRE_GROUPS', []),
        'ui_config': get_resource_service('ui_config').getSectionConfig('monitoring'),
        'saved_items': get_bookmarks_count(user['_id'], 'monitoring'),
        'formats': [{'format': f['format'], 'name': f['name']} for f in app.download_formatters.values()
                    if 'monitoring' in f['types']],
        'secondary_formats': [{'format': f[0], 'name': f[1]} for f in alert_types]
    }


def get_settings_data():
    return {"companies": [clean_company(company) for company in query_resource('companies',
                                                                               lookup={'sections.monitoring': True})]}


def process_form_request(updates, request_updates, form):
    if 'schedule' in request_updates:
        updates['schedule'] = request_updates['schedule']
        if updates['schedule'].get('interval') == 'immediate':
            updates['always_send'] = False
            updates['last_run_time'] = None

    if 'users' in request_updates:
        updates['users'] = [u['_id'] for u in get_items_by_id([ObjectId(u) for u in request_updates['users']], 'users')
                            if u['company'] == ObjectId(form.company.data)]

    if form.company.data:
        updates['company'] = ObjectId(form.company.data)

    if 'keywords' in request_updates:
        updates['keywords'] = request_updates['keywords']

    if 'email' in request_updates:
        updates['email'] = request_updates.get('email').replace(' ', '')


def get_monitoring_for_company(user):
    company = user['company'] if user and user.get('company') else None
    return [clean_company(company) for company in query_resource('monitoring', lookup={'company': company})]


@blueprint.route('/monitoring/<id>/users', methods=['POST'])
@account_manager_only
def update_users(id):
    profile = find_one('monitoring', _id=ObjectId(id))
    if not profile:
        return NotFound(gettext('monitoring Profile not found'))

    updates = flask.request.get_json()
    if 'users' in updates and len(updates.keys()) == 1:
        updates['users'] = [u['_id'] for u in get_items_by_id([ObjectId(u) for u in updates['users']], 'users')
                            if u['company'] == profile.get('company')]
        get_resource_service('monitoring').patch(id=ObjectId(id), updates=updates)
        return jsonify({'success': True}), 200


@blueprint.route('/monitoring/schedule_companies', methods=['GET'])
@account_manager_only
def monitoring_companies():
    monitoring_list = [clean_company(company) for company in
                       query_resource('monitoring', lookup={'schedule.interval': {'$ne': None}})]
    companies = get_items_by_id([ObjectId(m['company']) for m in monitoring_list], 'companies')
    return jsonify(companies), 200


@blueprint.route('/monitoring/<id>/schedule', methods=['POST'])
@account_manager_only
def update_schedule(id):
    updates = flask.request.get_json()
    if 'schedule' in updates and len(updates.keys()) == 1:
        schedule = updates.get('schedule')
        if schedule.get('interval') and not schedule.get('interval') in DELAYED_INTERVALS + [IMMEDIATE_INTERVAL]:
            return jsonify({'success': False})
        if schedule.get('time'):
            regex = r"^[0-2][0-9]:[0|3][0]$"
            if not re.match(regex, schedule.get('time')):
                return jsonify({'success': False})
        if schedule.get('day') and not schedule.get('day') in SCHEDULE_DAYS:
            return jsonify({'success': False})

        get_resource_service('monitoring').patch(id=ObjectId(id), updates=updates)
        return jsonify({'success': True}), 200


@blueprint.route('/monitoring/all', methods=['GET'])
def search_all():
    monitoring_list = [clean_company(company) for company in query_resource('monitoring')]
    return jsonify(monitoring_list), 200


@blueprint.route('/monitoring/search', methods=['GET'])
def search():
    response = get_internal('monitoring_search')
    return send_response('monitoring_search', response)


@blueprint.route('/monitoring/new', methods=['POST'])
@account_manager_only
def create():
    form = MonitoringForm()
    if form.validate():
        new_data = form.data
        if form.company.data:
            new_data['company'] = ObjectId(form.company.data)
            company_users = list(query_resource('users', lookup={'company': new_data['company']}))
            new_data['users'] = [ObjectId(u['_id']) for u in company_users]

        request_updates = flask.request.get_json()
        process_form_request(new_data, request_updates, form)

        set_original_creator(new_data)
        ids = get_resource_service('monitoring').post([new_data])
        return jsonify({
            'success': True,
            '_id': ids[0],
            'users': new_data.get('users')
        }), 201
    return jsonify(form.errors), 400


@blueprint.route('/monitoring/<_id>', methods=['GET', 'POST'])
@login_required
def edit(_id):
    if flask.request.args.get('context', '') == 'wire':
        items = get_items_for_user_action([_id], 'items')
        if not items:
            return

        item = items[0]
        if is_json_request(flask.request):
            return flask.jsonify(item)

    if 'print' in flask.request.args:
        assert flask.request.args.get('monitoring_profile')
        monitoring_profile = get_entity_or_404(flask.request.args.get('monitoring_profile'), 'monitoring')
        items = get_items_for_monitoring_report([_id], monitoring_profile, full_text=True)
        flask.request.view_args['date_items_dict'] = get_date_items_dict(items)
        flask.request.view_args['monitoring_profile'] = monitoring_profile
        flask.request.view_args['monitoring_report_name'] = app.config.get('MONITORING_REPORT_NAME', 'Newsroom')
        flask.request.view_args['print'] = True
        return wire_print(_id)

    profile = find_one('monitoring', _id=ObjectId(_id))
    if not profile:
        return NotFound(gettext('monitoring Profile not found'))

    if flask.request.method == 'POST':
        form = MonitoringForm(monitoring=profile)
        if form.validate_on_submit():
            updates = form.data
            request_updates = flask.request.get_json()

            # If the updates have anything other than 'users', only admin or monitoring_admin can update
            if len(request_updates.keys()) == 1 and 'users' not in request_updates:
                user = get_user()
                if not is_admin(user):
                    return jsonify({'error': 'Bad request'}), 400

                company = get_entity_or_404(profile['company'], 'companies')
                if str(user['_id']) != str(company.get('monitoring_administrator')):
                    return jsonify({'error': 'Bad request'}), 400

            process_form_request(updates, request_updates, form)
            set_version_creator(updates)
            get_resource_service('monitoring').patch(ObjectId(_id), updates=updates)
            return jsonify({'success': True}), 200
        return jsonify(form.errors), 400
    return jsonify(profile), 200


@blueprint.route('/monitoring/<_id>', methods=['DELETE'])
@admin_only
def delete(_id):
    """ Deletes the monitoring profile by given id """
    get_resource_service('monitoring').delete_action({'_id': ObjectId(_id)})
    return jsonify({'success': True}), 200


@blueprint.route('/monitoring')
@section('monitoring')
@login_required
def index():
    return flask.render_template('monitoring_index.html', data=get_view_data())


@blueprint.route('/monitoring/export/<_ids>')
@login_required
def export(_ids):
    user = get_user(required=True)
    _format = flask.request.args.get('format')
    if not _format:
        return jsonify({'message': 'No format specified.'}), 400

    layout_format = flask.request.args.get('secondary_format')
    formatter = app.download_formatters[_format]['formatter']
    monitoring_profile = get_entity_or_404(flask.request.args.get('monitoring_profile'), 'monitoring')
    monitoring_profile['format_type'] = _format
    monitoring_profile['alert_type'] = layout_format
    items = get_items_for_monitoring_report([_id for _id in _ids.split(',')], monitoring_profile)

    if len(items) > 0:
        try:
            _file = get_monitoring_file(monitoring_profile, items)
        except Exception as e:
            logger.exception(e)
            return jsonify({'message': 'Error exporting items to file'}), 400

        if _file:
            update_action_list(_ids.split(','), 'export', force_insert=True)
            get_resource_service('history').create_history_record(items, 'export', user, 'monitoring')

            return send_file(_file, mimetype=formatter.get_mimetype(None),
                             attachment_filename=formatter.format_filename(None), as_attachment=True)

    return jsonify({'message': 'No files to export.'}), 400


@blueprint.route('/monitoring/share', methods=['POST'])
@login_required
def share():
    data = get_json_or_400()
    assert data.get('users')
    assert data.get('items')
    assert data.get('monitoring_profile')
    current_user = get_user(required=True)
    monitoring_profile = get_entity_or_404(data.get('monitoring_profile'), 'monitoring')
    items = get_items_for_monitoring_report(data.get('items'), monitoring_profile)

    for user_id in data['users']:
        user = get_resource_service('users').find_one(req=None, _id=user_id)
        template_kwargs = {
            'recipient': user,
            'sender': current_user,
            'message': data.get('message'),
            'item_name': 'Monitoring Report',
        }
        formatter = app.download_formatters['monitoring_pdf']['formatter']
        monitoring_profile['format_type'] = 'monitoring_pdf'
        _file = get_monitoring_file(monitoring_profile, items)
        attachment = base64.b64encode(_file.read())

        send_email(
            [user['email']],
            gettext('From %s: %s' % (app.config['SITE_NAME'], monitoring_profile.get('subject',
                                                                                     monitoring_profile['name']))),
            text_body=flask.render_template('share_items.txt', **template_kwargs),
            html_body=flask.render_template('share_items.html', **template_kwargs),
            attachments_info=[{
                'file': attachment,
                'file_name': formatter.format_filename(None),
                'content_type': 'application/{}'.format(formatter.FILE_EXTENSION),
                'file_desc': 'Monitoring Report'
            }],
        )

    update_action_list(data.get('items'), 'shares')
    get_resource_service('history').create_history_record(items, 'share', current_user, 'monitoring')
    return jsonify({'success': True}), 200


@blueprint.route('/monitoring_bookmark', methods=['POST', 'DELETE'])
@login_required
def bookmark():
    """Bookmark an item.

    Stores user id into item.bookmarks array.
    Uses mongodb to update the array and then pushes updated array to elastic.
    """
    data = get_json_or_400()
    assert data.get('items')
    update_action_list(data.get('items'), 'bookmarks', item_type='items')
    user_id = get_user_id()
    push_user_notification('saved_items', count=get_bookmarks_count(user_id, 'monitoring'))
    return flask.jsonify(), 200


@blueprint.route('/bookmarks_monitoring')
@login_required
def bookmarks():
    data = get_view_data()
    data['bookmarks'] = True
    return flask.render_template('monitoring_bookmarks.html', data=data)
