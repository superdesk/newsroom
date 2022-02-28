
import newsroom
from content_api import MONGO_PREFIX


class MonitoringResource(newsroom.Resource):
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
            'type': 'objectid'
        },
        # Additional email addresses to send the monitoring email to, They do not need to belong to a newsroom user,
        # they are intended to usually belong to a distribution list of the client company
        'email': {
            'type': 'string',
            'nullable': True
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
            'mapping': {'type': 'objectid'}
        },
        'schedule': {
            'type': 'dict',
            'schema': {
                'interval': {'type': 'string'},
                'time': {'type': 'string'},
                'day': {'type': 'string'},
            }
        },
        'keywords': {
            'type': 'list',
            'mapping': {'type': 'string'}
        },
        'last_run_time': {'type': 'datetime'},
        'original_creator': newsroom.Resource.rel('users'),
        'version_creator': newsroom.Resource.rel('users'),
        'format_type': {'type': 'string'},
        'always_send': {
            'type': 'boolean',
        },
        'headline_subject': {
            'type': 'boolean',
            'default': False
        }
    }
    datasource = {
        'source': 'monitoring',
        'default_sort': [('name', 1)]
    }
    item_methods = ['GET', 'PATCH', 'DELETE']
    resource_methods = ['GET', 'POST']
    mongo_prefix = MONGO_PREFIX


class MonitoringService(newsroom.Service):
    pass
