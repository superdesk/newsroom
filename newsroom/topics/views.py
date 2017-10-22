from bson import ObjectId
from superdesk import get_resource_service
from newsroom.topics import blueprint
from newsroom.auth.decorator import login_required
from flask import jsonify
from newsroom.wire import views


@blueprint.route('/topics/<id>', methods=['POST'])
@login_required
def update_topic(id):
    """ Updates a followed topic """
    data = views.get_json_or_400()
    updates = {
        'label': data.get('label'),
        'notifications': data.get('notifications', False),
        'query': data.get('query')
    }

    get_resource_service('topics').patch(id=ObjectId(id), updates=updates)
    return jsonify({'success': True}), 200
