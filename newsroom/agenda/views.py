from newsroom.agenda import blueprint

import flask

from flask import current_app as app, request
from eve.methods.get import get_internal
from eve.render import send_response
from superdesk import get_resource_service

from newsroom.template_filters import is_admin_or_internal, is_admin
from newsroom.topics import get_user_topics
from newsroom.navigations.navigations import get_navigations_by_company
from newsroom.auth import get_user
from newsroom.decorator import login_required
from newsroom.utils import get_entity_or_404, is_json_request, get_json_or_400, \
    get_agenda_dates, get_location_string, get_public_contacts, get_links, get_vocabulary
from newsroom.wire.utils import update_action_list
from newsroom.agenda.email import send_coverage_request_email
from newsroom.agenda.utils import remove_fields_for_public_user
from newsroom.companies import section, get_user_company
from newsroom.notifications import push_user_notification


@blueprint.route('/agenda')
@login_required
@section('agenda')
def index():
    return flask.render_template('agenda_index.html', data=get_view_data())


@blueprint.route('/bookmarks_agenda')
@login_required
def bookmarks():
    data = get_view_data()
    data['bookmarks'] = True
    return flask.render_template('agenda_bookmarks.html', data=data)


@blueprint.route('/agenda/<_id>')
@login_required
def item(_id):
    item = get_entity_or_404(_id, 'agenda')

    user = get_user()
    company = get_user_company(user)
    if not is_admin_or_internal(user):
        remove_fields_for_public_user(item)

    if company and not is_admin(user) and company.get('events_only', False):
        # if the company has permission events only permission then
        # remove planning items and coverages.
        if not item.get('event'):
            # for adhoc planning items abort the request
            flask.abort(403)

        item.pop('planning_items', None)
        item.pop('coverages', None)

    if is_json_request(flask.request):
        return flask.jsonify(item)

    if 'print' in flask.request.args:
        map = flask.request.args.get('map')
        template = 'agenda_item_print.html'
        update_action_list([_id], 'prints', force_insert=True)
        get_resource_service('history').create_history_record([item], 'print', get_user(),
                                                              request.args.get('type', 'agenda'))
        return flask.render_template(
            template,
            item=item,
            map=map,
            dateString=get_agenda_dates(item),
            location=get_location_string(item),
            contacts=get_public_contacts(item),
            links=get_links(item),
            is_admin=is_admin_or_internal(user)
        )

    data = get_view_data()
    data['item'] = item
    return flask.render_template('agenda_index.html', data=data, title=item.get('name', item.get('headline')))


@blueprint.route('/agenda/search')
@login_required
def search():
    response = get_internal('agenda')
    return send_response('agenda', response)


def get_view_data():
    user = get_user()
    topics = get_user_topics(user['_id']) if user else []
    company = get_user_company(user) or {}
    return {
        'user': str(user['_id']) if user else None,
        'company': str(user['company']) if user and user.get('company') else None,
        'topics': [t for t in topics if t.get('topic_type') == 'agenda'],
        'formats': [{'format': f['format'], 'name': f['name']} for f in app.download_formatters.values()
                    if 'agenda' in f['types']],
        'navigations': get_navigations_by_company(str(user['company']) if user and user.get('company') else None,
                                                  product_type='agenda',
                                                  events_only=company.get('events_only', False)),
        'saved_items': get_resource_service('agenda').get_saved_items_count(),
        'events_only': company.get('events_only', False),
        'locators': get_vocabulary('locators')
    }


@blueprint.route('/agenda/request_coverage', methods=['POST'])
@login_required
def request_coverage():
    user = get_user(required=True)
    data = get_json_or_400()
    assert data.get('item')
    assert data.get('message')
    item = get_entity_or_404(data.get('item'), 'agenda')
    send_coverage_request_email(user, data.get('message'), item['_id'])
    return flask.jsonify(), 201


@blueprint.route('/agenda_bookmark', methods=['POST', 'DELETE'])
@login_required
def bookmark():
    data = get_json_or_400()
    assert data.get('items')
    update_action_list(data.get('items'), 'bookmarks', item_type='agenda')
    push_user_notification('saved_items', count=get_resource_service('agenda').get_saved_items_count())
    return flask.jsonify(), 200


@blueprint.route('/agenda_watch', methods=['POST', 'DELETE'])
@login_required
def follow():
    data = get_json_or_400()
    assert data.get('items')
    update_action_list(data.get('items'), 'watches', item_type='agenda')
    push_user_notification('saved_items', count=get_resource_service('agenda').get_saved_items_count())
    return flask.jsonify(), 200
