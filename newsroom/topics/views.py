from urllib import parse
from bson import ObjectId
from superdesk import get_resource_service
from newsroom.topics import blueprint
from newsroom.utils import find_one
from newsroom.auth import get_user
from newsroom.auth.decorator import login_required
from flask import jsonify, abort, session, render_template, current_app as app
from newsroom.utils import get_json_or_400, get_entity_or_404
from newsroom.email import send_email
from newsroom.notifications import push_user_notification
from flask_babel import gettext


@blueprint.route('/topics/<id>', methods=['POST'])
@login_required
def update_topic(id):
    """ Updates a followed topic """
    data = get_json_or_400()

    if not is_user_topic(id, session['user']):
        abort(403)

    updates = {
        'label': data.get('label'),
        'notifications': data.get('notifications', False),
        'query': data.get('query')
    }

    get_resource_service('topics').patch(id=ObjectId(id), updates=updates)
    push_user_notification('topics')
    return jsonify({'success': True}), 200


@blueprint.route('/topics/<id>', methods=['DELETE'])
@login_required
def delete(id):
    """ Deletes a followed topic by given id """
    if not is_user_topic(id, session['user']):
        abort(403)

    get_resource_service('topics').delete({'_id': ObjectId(id)})
    push_user_notification('topics')
    return jsonify({'success': True}), 200


def is_user_topic(topic_id, user_id):
    """
    Checks if the topic with topic_id belongs to user with user_id
    """
    topic = find_one('topics', _id=ObjectId(topic_id))
    if topic and str(topic.get('user')) == user_id:
        return True
    return False


@blueprint.route('/topic_share', methods=['POST'])
@login_required
def share():
    current_user = get_user(required=True)
    data = get_json_or_400()
    assert data.get('users')
    assert data.get('items')
    topic = get_entity_or_404(data.get('items')[0]['_id'], 'topics')
    with app.mail.connect() as connection:
        for user_id in data['users']:
            user = get_resource_service('users').find_one(req=None, _id=user_id)
            if not user or not user.get('email'):
                continue
            template_kwargs = {
                'recipient': user,
                'sender': current_user,
                'topic': topic,
                'url': '{}/wire?q={}'.format(app.config['CLIENT_URL'], parse.quote(topic['query'])),
                'message': data.get('message'),
                'app_name': app.config['SITE_NAME'],
            }
            send_email(
                [user['email']],
                gettext('From %s: %s' % (app.config['SITE_NAME'], topic['label'])),
                render_template('share_topic.txt', **template_kwargs),
                sender=current_user['email'],
                connection=connection
            )
    return jsonify(), 201
