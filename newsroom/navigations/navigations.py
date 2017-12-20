import newsroom
import superdesk


class NavigationsResource(newsroom.Resource):
    """
    Navigations schema
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
        'is_enabled': {
            'type': 'boolean',
            'default': True
        },
        'order': {
            'type': 'integer',
            'nullable': 'true'
        }
    }
    datasource = {
        'source': 'navigations',
        'default_sort': [('order', 1), ('name', 1)]
    }
    item_methods = ['GET', 'PATCH', 'DELETE']
    resource_methods = ['GET', 'POST']


class NavigationsService(newsroom.Service):
    pass


def get_navigations_by_company(company_id):
    """
    Returns list of navigations for given company id
    Navigations will contain the list of product ids
    """
    product_lookup = {'is_enabled': True, 'companies': str(company_id)}
    products = list(superdesk.get_resource_service('products').get(req=None, lookup=product_lookup))

    # Get the navigation ids used across products
    navigation_ids = []
    [navigation_ids.extend(p.get('navigations', [])) for p in products]

    # Get the list of navigations for navigation_ids
    navigations = list(superdesk.get_resource_service('navigations')
                       .get(req=None, lookup={'_id': {'$in': navigation_ids}, 'is_enabled': True}))

    return navigations
