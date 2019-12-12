import newsroom
import superdesk

from newsroom.products.products import get_products_by_company


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
            'nullable': True
        },
        'product_type': {
            'type': 'string',
            'default': 'wire'
        },
        # list of images for tile based navigation
        'tile_images': {
            'type': 'list',
            'nullable': True
        },
        'original_creator': newsroom.Resource.rel('users'),
        'version_creator': newsroom.Resource.rel('users'),
    }

    datasource = {
        'source': 'navigations',
        'default_sort': [('order', 1), ('name', 1)]
    }
    item_methods = ['GET', 'PATCH', 'DELETE']
    resource_methods = ['GET', 'POST']


class NavigationsService(newsroom.Service):
    pass


def get_navigations_by_company(company_id, product_type='wire', events_only=False):
    """
    Returns list of navigations for given company id
    Navigations will contain the list of product ids
    """
    products = get_products_by_company(company_id, None, product_type)

    # Get the navigation ids used across products
    navigation_ids = []
    [navigation_ids.extend(p.get('navigations', [])) for p in products]
    return get_navigations_by_ids(navigation_ids)


def get_navigations_by_ids(navigation_ids):
    """
    Returns the list of navigations for navigation_ids
    """
    if not navigation_ids:
        return []

    return list(superdesk.get_resource_service('navigations')
                .get(req=None, lookup={'_id': {'$in': navigation_ids}, 'is_enabled': True}))
