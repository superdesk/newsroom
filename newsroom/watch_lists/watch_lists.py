
import newsroom
from content_api import MONGO_PREFIX


class WatchListsResource(newsroom.Resource):
    """
    Company schema
    """

    schema = {
        'name': {
            'type': 'string',
            'required': True
        },
        'subject': {
            'type': 'string'
        },
        'description': {
            'type': 'string'
        },
        'company': {
            'type': 'ObjectId'
        },
        'query': {
            'type': 'string'
        },
        'alert_type': {
            'type': 'string'
        },
        'is_enabled': {
            'type': 'boolean',
        },
        'users': {
            'type': 'list',
            'mapping': {'type': 'ObjectId'}
        },
        'schedule': {
            'type': 'dict',
            'schema': {
                'interval': {'type': 'string'},
                'time': {'type': 'string'},
            }
        },
        'keywords': {
            'type': 'list',
            'mapping': {'type': 'string'}
        }
    }
    datasource = {
        'source': 'watch_lists',
        'default_sort': [('name', 1)]
    }
    item_methods = ['GET', 'PATCH', 'DELETE']
    resource_methods = ['GET', 'POST']
    mongo_prefix = MONGO_PREFIX


class WatchListsService(newsroom.Service):
    pass
