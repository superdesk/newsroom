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
    query_objectid_as_string = True  # needed for companies/navigations lookup to work


class ProductsService(newsroom.Service):
    pass


def get_products_by_navigation(navigation_id):
    return list(superdesk.get_resource_service('products').
                get(req=None, lookup={'navigations': str(navigation_id), 'is_enabled': True}))


def get_products_by_company(company_id, navigation_id=None):
    lookup = {'is_enabled': True, 'companies': str(company_id)}
    if navigation_id:
        lookup['navigations'] = str(navigation_id)
    return list(superdesk.get_resource_service('products').get(req=None, lookup=lookup))


def get_products_dict_by_company(company_id):
    lookup = {'is_enabled': True, 'companies': str(company_id)}
    return list(superdesk.get_resource_service('products').get(req=None, lookup=lookup))
