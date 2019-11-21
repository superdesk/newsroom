import flask
import io
from bson import ObjectId
from flask import jsonify, current_app as app, render_template, send_file
from flask_babel import gettext
from superdesk import get_resource_service
from werkzeug.exceptions import NotFound
from werkzeug.utils import secure_filename
from eve.methods.get import get_internal
from eve.render import send_response
from newsroom.decorator import admin_only, login_required
from newsroom.companies import section
from newsroom.watch_lists import blueprint
from .forms import WatchListsForm
from newsroom.utils import query_resource, find_one, get_items_by_id, get_entity_or_404, get_json_or_400
from newsroom.template_filters import is_admin
from newsroom.auth import get_user, get_user_id
from newsroom.wire.utils import update_action_list
from newsroom.wire.views import item as wire_print
from superdesk.utc import utcnow
from newsroom.notifications import push_user_notification
from newsroom.wire.search import get_bookmarks_count


def get_view_data():
    user = get_user()
    return {
        'user': str(user['_id']) if user else None,
        'company': str(user['company']) if user and user.get('company') else None,
        'navigations': get_watch_lists_for_company(user),
        'context': 'watch_lists',
        'groups': app.config.get('WATCH_LIST_GROUPS') or app.config.get('WIRE_GROUPS', []),
        'ui_config': get_resource_service('ui_config').getSectionConfig('watch_lists'),
        'saved_items': get_bookmarks_count(user['_id'], 'watch_lists'),
        'formats': [{'format': f['format'], 'name': f['name']} for f in app.download_formatters.values()
                    if 'watch_lists' in f['types']],
    }


def get_settings_data():
    return {"companies": list(query_resource('companies', lookup={'sections.watch_lists': True}))}


def process_form_request(updates, request_updates, form):
    if 'schedule' in request_updates:
        updates['schedule'] = request_updates['schedule']

    if 'users' in request_updates:
        updates['users'] = [ObjectId(u) for u in request_updates['users']]

    if form.company.data:
        updates['company'] = ObjectId(form.company.data)

    if 'keywords' in request_updates:
        updates['keywords'] = request_updates['keywords']


def get_watch_lists_for_company(user):
    company = user['company'] if user and user.get('company') else None
    return list(query_resource('watch_lists', lookup={'company': company}))


@blueprint.route('/watch_lists/<id>/users', methods=['POST'])
@admin_only
def update_users(id):
    updates = flask.request.get_json()
    if 'users' in updates:
        updates['users'] = [ObjectId(u_id) for u_id in updates['users']]
        get_resource_service('watch_lists').patch(id=ObjectId(id), updates=updates)
        return jsonify({'success': True}), 200


@blueprint.route('/watch_lists/schedule_companies', methods=['GET'])
@admin_only
def watch_list_companies():
    watch_lists = list(query_resource('watch_lists', lookup={'schedule.interval': {'$ne': None}}))
    companies = get_items_by_id([ObjectId(w['company']) for w in watch_lists], 'companies')
    return jsonify(companies), 200


@blueprint.route('/watch_lists/<id>/schedule', methods=['POST'])
@admin_only
def update_schedule(id):
    updates = flask.request.get_json()
    get_resource_service('watch_lists').patch(id=ObjectId(id), updates=updates)
    return jsonify({'success': True}), 200


@blueprint.route('/watch_lists/all', methods=['GET'])
def search_all():
    watch_lists = list(query_resource('watch_lists'))
    return jsonify(watch_lists), 200


@blueprint.route('/watch_lists/search', methods=['GET'])
def search():
    response = get_internal('watch_lists_search')
    return send_response('watch_lists_search', response)


@blueprint.route('/watch_lists/new', methods=['POST'])
@admin_only
def create():
    form = WatchListsForm()
    if form.validate():
        new_watch_list = form.data
        if form.company.data:
            new_watch_list['company'] = ObjectId(form.company.data)
            company_users = list(query_resource('users', lookup={'company': new_watch_list['company']}))
            new_watch_list['users'] = [ObjectId(u['_id']) for u in company_users]

        request_updates = flask.request.get_json()
        process_form_request(new_watch_list, request_updates, form)

        ids = get_resource_service('watch_lists').post([new_watch_list])
        return jsonify({
            'success': True,
            '_id': ids[0],
            'users': new_watch_list.get('users')
        }), 201
    return jsonify(form.errors), 400


@blueprint.route('/watch_lists/<_id>', methods=['GET', 'POST'])
@login_required
def edit(_id):
    if 'print' in flask.request.args:
        return wire_print(_id)

    watch_list = find_one('watch_lists', _id=ObjectId(_id))
    if not watch_list:
        return NotFound(gettext('Watch List not found'))

    if flask.request.method == 'POST':
        form = WatchListsForm(watch_list=watch_list)
        if form.validate_on_submit():
            updates = form.data
            request_updates = flask.request.get_json()

            # If the updates have anything other than 'users', only admin or watch_list_admin can update
            if len(request_updates.keys()) == 1 and 'users' not in request_updates:
                user = get_user()
                if not is_admin(user):
                    return jsonify({'error': 'Bad request'}), 400

                company = get_entity_or_404(watch_list['company'], 'companies')
                if str(user['_id']) != str(company.get('watch_list_administrator')):
                    return jsonify({'error': 'Bad request'}), 400

            process_form_request(updates, request_updates, form)
            get_resource_service('watch_lists').patch(ObjectId(_id), updates=updates)
            return jsonify({'success': True}), 200
        return jsonify(form.errors), 400
    return jsonify(watch_list), 200


@blueprint.route('/watch_lists/<_id>', methods=['DELETE'])
@admin_only
def delete(_id):
    """ Deletes the watch_list by given id """
    get_resource_service('watch_lists').delete_action({'_id': ObjectId(_id)})
    return jsonify({'success': True}), 200


@blueprint.route('/watch_lists')
@section('watch_lists')
@login_required
def index():
    return flask.render_template('watch_lists_index.html', data=get_view_data())


@blueprint.route('/watch_lists/export/<_ids>')
@login_required
def export(_ids):
    user = get_user(required=True)
    items = get_items_by_id([_id for _id in _ids.split(',')], 'items')
    if len(items) > 0:
        exported_text = str.encode(render_template('watch_list_export.html', items=items), 'utf-8')
        update_action_list(_ids.split(','), 'export', force_insert=True)
        get_resource_service('history').create_history_record(items, 'export', user, 'watch_lists')

        if exported_text:
            try:
                temp_file = io.BytesIO()
                attachment_filename = '%s-export.txt' % utcnow().strftime('%Y%m%d%H%M%S')
                temp_file.write(exported_text)
                temp_file.seek(0)
                mimetype = 'text/plain'
                attachment_filename = secure_filename(attachment_filename)
                return send_file(temp_file, mimetype=mimetype, attachment_filename=attachment_filename,
                                 as_attachment=True)
            except Exception:
                return jsonify({'message': 'Error exporting items to file'}), 400
    else:
        return jsonify({'message': 'No files to export.'}), 400


@blueprint.route('/watch_lists_bookmark', methods=['POST', 'DELETE'])
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
    push_user_notification('saved_items', count=get_bookmarks_count(user_id, 'watch_lists'))
    return flask.jsonify(), 200


@blueprint.route('/bookmarks_watch_lists')
@login_required
def bookmarks():
    data = get_view_data()
    data['bookmarks'] = True
    return flask.render_template('watch_lists_bookmarks.html', data=data)
