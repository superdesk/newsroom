
import newsroom
import superdesk

from content_api import MONGO_PREFIX


class ProductsResource(newsroom.Resource):
    """
    Products schema
    """

    schema = {
        'name': {
            'type': 'string',
            'unique': True,
            'required': True
        },
        'description': {
            'type': 'string'
        },
        'sd_product_id': {
            'type': 'string'
        },
        'query': {
            'type': 'string'
        },
        'is_enabled': {
            'type': 'boolean',
            'default': True
        },
        'product_type': {
            'type': 'string',
            'allowed': ['top_level', 'query', 'superdesk', 'curated']
        },
        'parents': {
            'type': 'list',
            'nullable': True,
        },
        'companies': {
            'type': 'list',
            'nullable': True,
        },
    }
    datasource = {
        'source': 'products',
        'default_sort': [('name', 1)]
    }
    item_methods = ['GET', 'PATCH', 'DELETE']
    resource_methods = ['GET', 'POST']
    mongo_prefix = MONGO_PREFIX


class ProductsService(newsroom.Service):
    pass


def get_sub_products(parent_product_id):
    return list(superdesk.get_resource_service('products').get(req=None, lookup={'parents': parent_product_id}))

