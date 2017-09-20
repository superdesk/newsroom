
import newsroom
import superdesk


class TopicsResource(newsroom.Resource):
    url = 'users/<regex("[a-f0-9]{24}"):user>/topics'
    resource_methods = ['GET', 'POST']
    item_methods = ['GET', 'PATCH', 'DELETE']
    schema = {
        'label': {'type': 'string', 'required': True},
        'query': {'type': 'string', 'required': True},
        'description': {'type': 'string'},
        'user': {'type': 'objectid'},
    }


class TopicsService(newsroom.Service):
    pass


def get_user_topics(user_id):
    return list(superdesk.get_resource_service('topics').get(req=None, lookup={'user': user_id}))
