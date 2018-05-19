
import newsroom
from content_api import MONGO_PREFIX


class CompaniesResource(newsroom.Resource):
    """
    Company schema
    """

    schema = {
        'name': {
            'type': 'string',
            'unique': True,
            'required': True
        },
        'url': {
            'type': 'string'
        },
        'sd_subscriber_id': {
            'type': 'string'
        },
        'is_enabled': {
            'type': 'boolean',
            'default': True
        },
        'contact_name': {
            'type': 'string'
        },
        'contact_email': {
            'type': 'string'
        },
        'phone': {
            'type': 'string'
        },
        'country': {
            'type': 'string'
        },
        'expiry_date': {
            'type': 'datetime',
            'nullable': True,
            'required': False,
        },
    }
    datasource = {
        'source': 'companies',
        'default_sort': [('name', 1)]
    }
    item_methods = ['GET', 'PATCH', 'DELETE']
    resource_methods = ['GET', 'POST']
    mongo_prefix = MONGO_PREFIX


class CompaniesService(newsroom.Service):
    pass
