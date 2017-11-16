
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
    }


class TopicsService(newsroom.Service):
    pass


def get_user_topics(user_id):
    return list(superdesk.get_resource_service('topics').get(req=None, lookup={'user': user_id}))


def get_notification_topics():
    return list(superdesk.get_resource_service('topics').get(req=None, lookup={'notifications': True}))
