
import newsroom
import superdesk


class TopicsResource(newsroom.Resource):
    url = 'users/<regex("[a-f0-9]{24}"):user>/topics'
    resource_methods = ['GET', 'POST']
    item_methods = ['GET', 'PATCH', 'DELETE']
    schema = {
        'label': {'type': 'string', 'required': True},
        'query': {'type': 'string', 'nullable': True},
        'filter': {'type': 'dict', 'nullable': True},
        'created': {'type': 'dict', 'nullable': True},
        'notifications': {'type': 'boolean', 'default': False},
        'user': {'type': 'objectid'},
        'timezone_offset': {'type': 'integer', 'nullable': True},
        'topic_type': {'type': 'string', 'nullable': True},
        'navigation': {
            'type': 'list',
            'nullable': True,
            'schema': {'type': 'string'},
        }
    }


class TopicsService(newsroom.Service):
    pass


def get_user_topics(user_id):
    return list(superdesk.get_resource_service('topics').get(req=None, lookup={'user': user_id}))


def get_wire_notification_topics():
    lookup = {'$and': [{'notifications': True}, {'topic_type': 'wire'}]}
    return list(superdesk.get_resource_service('topics').get(req=None, lookup=lookup))


def get_agenda_notification_topics(item, users):
    """
    Returns active topics for a given agenda item
    :param item: agenda item
    :param users: active users dict
    :return: list of topics
    """
    lookup = {'$and': [
        {'notifications': True},
        {'topic_type': 'agenda'},
        {'query': item['_id']}
    ]}
    topics = list(superdesk.get_resource_service('topics').get(req=None, lookup=lookup))

    # filter out the topics those belong to inactive users
    return [t for t in topics if users.get(str(t['user']))]
