from bson import ObjectId
from superdesk import get_resource_service
from newsroom.topics import blueprint
from newsroom.utils import find_one
from newsroom.auth.decorator import login_required
from flask import jsonify, abort, session
from newsroom.wire import views


@blueprint.route('/topics/<id>', methods=['POST'])
@login_required
def update_topic(id):
    """ Updates a followed topic """
    data = views.get_json_or_400()

    if not is_user_topic(id, session['user']):
        abort(403)

    updates = {
        'label': data.get('label'),
        'notifications': data.get('notifications', False),
        'query': data.get('query')
    }

    get_resource_service('topics').patch(id=ObjectId(id), updates=updates)
    return jsonify({'success': True}), 200


@blueprint.route('/topics/<id>', methods=['DELETE'])
@login_required
def delete(id):
    """ Deletes a followed topic by given id """
    if not is_user_topic(id, session['user']):
        abort(403)

    get_resource_service('topics').delete({'_id': ObjectId(id)})
    return jsonify({'success': True}), 200


def is_user_topic(topic_id, user_id):
    """
    Checks if the topic with topic_id belongs to user with user_id
    """
    topic = find_one('topics', _id=ObjectId(topic_id))
    if topic and str(topic.get('user')) == user_id:
        return True
    return False
