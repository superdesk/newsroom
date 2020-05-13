from newsroom.agenda import blueprint

import flask

from flask import current_app as app, request
from flask_babel import gettext
from eve.methods.get import get_internal
from eve.render import send_response
from superdesk import get_resource_service
from eve.utils import ParsedRequest

from newsroom.template_filters import is_admin_or_internal, is_admin
from newsroom.topics import get_user_topics
from newsroom.navigations.navigations import get_navigations_by_company
from newsroom.auth import get_user, get_user_id
from newsroom.decorator import login_required
from newsroom.utils import get_entity_or_404, is_json_request, get_json_or_400, get_entities_elastic_or_mongo_or_404, \
    get_agenda_dates, get_location_string, get_public_contacts, get_links, get_vocabulary
from newsroom.wire.utils import update_action_list
from newsroom.wire.views import set_item_permission
from newsroom.agenda.email import send_coverage_request_email
from newsroom.agenda.utils import remove_fields_for_public_user
from newsroom.companies import section, get_user_company
from newsroom.notifications import push_user_notification
import json


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
        'locators': get_vocabulary('locators'),
        'ui_config': get_resource_service('ui_config').getSectionConfig('agenda')
    }


@blueprint.route('/agenda/request_coverage', methods=['POST'])
@login_required
def request_coverage():
    user = get_user(required=True)
    data = get_json_or_400()
    assert data.get('item')
    assert data.get('message')
    item = get_entity_or_404(data.get('item'), 'agenda')
    send_coverage_request_email(user, data.get('message'), item)
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
    for item_id in data.get('items'):
        user_id = get_user_id()
        item = get_entity_or_404(item_id, 'agenda')
        coverage_updates = {'coverages': item.get('coverages') or []}
        for c in coverage_updates['coverages']:
            if c.get('watches') and user_id in c['watches']:
                c['watches'].remove(user_id)

        if request.method == 'POST':
            updates = {'watches': list(set((item.get('watches') or []) + [user_id]))}
            if item.get('coverages'):
                updates.update(coverage_updates)

            get_resource_service('agenda').patch(item_id, updates)
        else:
            if request.args.get('bookmarks'):
                user_item_watches = [u for u in (item.get('watches') or []) if str(u) == str(user_id)]
                if not user_item_watches:
                    # delete user watches of all coverages
                    get_resource_service('agenda').patch(item_id, coverage_updates)
                    return flask.jsonify(), 200

            update_action_list(data.get('items'), 'watches', item_type='agenda')

    push_user_notification('saved_items', count=get_resource_service('agenda').get_saved_items_count())
    return flask.jsonify(), 200


@blueprint.route('/agenda_coverage_watch', methods=['POST', 'DELETE'])
@login_required
def watch_coverage():
    user_id = get_user_id()
    data = get_json_or_400()
    assert data.get('item_id')
    assert data.get('coverage_id')
    item = get_entity_or_404(data['item_id'], 'agenda')

    if item.get('watches') and user_id in item['watches']:
        return flask.jsonify({'error': gettext('Cannot edit coverage watch when watching a parent item.')}), 403

    try:
        coverage_index = [c['coverage_id'] for c in (item.get('coverages') or [])].index(data['coverage_id'])
    except ValueError:
        return flask.jsonify({'error': gettext('Coverage not found.')}), 404

    updates = {'coverages': item['coverages']}
    if request.method == 'POST':
        updates['coverages'][coverage_index]['watches'] = list(set((updates['coverages'][coverage_index].get('watches')
                                                                    or []) + [user_id]))
    else:
        try:
            updates['coverages'][coverage_index]['watches'].remove(user_id)
        except Exception:
            return flask.jsonify({'error': gettext('Error removing watch.')}), 404

    get_resource_service('agenda').patch(data['item_id'], updates)
    return flask.jsonify(), 200


@blueprint.route('/agenda/wire_items/<wire_id>')
@login_required
def related_wire_items(wire_id):
    elastic = app.data._search_backend('agenda')
    source = {}
    must_terms = [{'term': {'coverages.delivery_id': {"value": wire_id}}}]
    query = {
        'bool': {
            'must': must_terms
            },
    }

    source.update({'query': {
        "nested": {
            "path": "coverages",
            "query": query
        }
    }})
    internal_req = ParsedRequest()
    internal_req.args = {'source': json.dumps(source)}
    agenda_result = elastic.find('agenda', internal_req, None)

    if len(agenda_result.docs) == 0:
        return flask.jsonify({'error': gettext('Agenda item not found')}), 404

    wire_ids = []
    for cov in agenda_result.docs[0].get('coverages') or []:
        if cov.get('coverage_type') == 'text' and cov.get('delivery_id'):
            wire_ids.append(cov['delivery_id'])

    wire_items = get_entities_elastic_or_mongo_or_404(wire_ids, 'items')
    aggregations = {"uid": {"terms": {"field": "_uid"}}}
    permissioned_result = get_resource_service('wire_search').get_items(wire_ids, size=0, aggregations=aggregations,
                                                                        apply_permissions=True)
    buckets = permissioned_result.hits['aggregations']['uid']['buckets']
    permissioned_ids = []
    for b in buckets:
        permissioned_ids.append(b['key'].replace('items#', ''))

    for wire_item in wire_items:
        set_item_permission(wire_item, wire_item.get('_id') in permissioned_ids)

    return flask.jsonify({
        'agenda_item': agenda_result.docs[0],
        'wire_items': wire_items,
    }), 200
