import newsroom
import superdesk


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
            'allowed': ['query', 'superdesk', 'curated']
        },
        'navigations': {
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


class ProductsService(newsroom.Service):
    pass


def get_products_by_navigation(navigation_id):
    return list(superdesk.get_resource_service('products').
                get(req=None, lookup={'navigations': navigation_id, 'is_enabled': True}))


def get_products_by_company(company_id):
    # TODO(tolga): this lookup by company id is not working
    products = list(superdesk.get_resource_service('products').get(req=None, lookup={'is_enabled': True}))
    return [p for p in products if str(company_id) in p.get('companies')]


def get_products_dict_by_company(company_id):
    # TODO(tolga): this lookup by company id is not working
    products = list(superdesk.get_resource_service('products').get(req=None, lookup={'is_enabled': True}))
    return {str(p['_id']): p for p in products if str(company_id) in p.get('companies')}
