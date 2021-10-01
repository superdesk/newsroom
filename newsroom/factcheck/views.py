import flask
import logging
from flask import current_app as app
from eve.render import send_response
from eve.methods.get import get_internal

from superdesk import get_resource_service
from newsroom.factcheck import blueprint
from newsroom.auth import get_user, get_user_id
from newsroom.decorator import login_required
from newsroom.companies import section
from newsroom.wire.search import get_bookmarks_count
from newsroom.wire.views import update_action_list, get_previous_versions, set_permissions
from newsroom.utils import get_json_or_400, get_entity_or_404, is_json_request, get_type
from newsroom.notifications import push_user_notification

logger = logging.getLogger(__name__)


def get_view_data():
    """Get the view data"""
    user = get_user()
    return {
        'user': str(user['_id']) if user else None,
        'company': str(user['company']) if user and user.get('company') else None,
        'navigations': [],
        'formats': [{'format': f['format'], 'name': f['name']} for f in app.download_formatters.values()
                    if 'wire' in f['types']],
        'saved_items': get_bookmarks_count(user['_id'], 'factcheck'),
        'context': 'factcheck',
        'ui_config': get_resource_service('ui_config').getSectionConfig('factcheck')
    }


@blueprint.route('/factcheck')
@login_required
@section('factcheck')
def index():
    return flask.render_template('factcheck_index.html', data=get_view_data())


@blueprint.route('/factcheck/search')
@login_required
@section('factcheck')
def search():
    response = get_internal('factcheck_search')
    return send_response('factcheck_search', response)


@blueprint.route('/bookmarks_factcheck')
@login_required
def bookmarks():
    data = get_view_data()
    data['bookmarks'] = True
    return flask.render_template('factcheck_bookmarks.html', data=data)


@blueprint.route('/factcheck_bookmark', methods=['POST', 'DELETE'])
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
    push_user_notification('saved_items', count=get_bookmarks_count(user_id, 'factcheck'))
    return flask.jsonify(), 200


@blueprint.route('/factcheck/<_id>/copy', methods=['POST'])
@login_required
def copy(_id):
    item_type = get_type()
    get_entity_or_404(_id, item_type)
    update_action_list([_id], 'copies', item_type=item_type)
    return flask.jsonify(), 200


@blueprint.route('/factcheck/<_id>/versions')
@login_required
def versions(_id):
    item = get_entity_or_404(_id, 'items')
    items = get_previous_versions(item)
    return flask.jsonify({'_items': items})


@blueprint.route('/factcheck/<_id>')
@login_required
def item(_id):
    item = get_entity_or_404(_id, 'items')
    set_permissions(item, 'factcheck')
    display_char_count = get_resource_service('ui_config').getSectionConfig('factcheck').get('char_count', False)
    if is_json_request(flask.request):
        return flask.jsonify(item)
    if not item.get('_access'):
        return flask.render_template('wire_item_access_restricted.html', item=item)
    previous_versions = get_previous_versions(item)
    if 'print' in flask.request.args:
        template = 'wire_item_print.html'
        update_action_list([_id], 'prints', force_insert=True)
    else:
        template = 'wire_item.html'
    return flask.render_template(
        template,
        item=item,
        previous_versions=previous_versions,
        display_char_count=display_char_count)
