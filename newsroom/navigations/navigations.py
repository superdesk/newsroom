import newsroom
import superdesk
from flask import current_app


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


def get_navigations_by_company(company_id, product_type='wire'):
    """
    Returns list of navigations for given company id
    Navigations will contain the list of product ids
    """
    product_lookup = {'is_enabled': True, 'companies': str(company_id), 'product_type': product_type}
    products = list(superdesk.get_resource_service('products').get(req=None, lookup=product_lookup))

    # Get the navigation ids used across products
    navigation_ids = []

    if current_app.config.get('AGENDA_FEATURED_STORY_NAVIGATION_POSITION_OVERRIDE') and product_type == 'agenda':
        navigations = []
        featured_navigation_ids = []

        # fetch navigations for featured products
        [featured_navigation_ids.extend(p.get('navigations', [])) for p in products if p.get('query') == '_featured']
        navigations.extend(get_navigations_by_ids(featured_navigation_ids))

        # fetch all other navigations
        [navigation_ids.extend(p.get('navigations', [])) for p in products if p.get('query') != '_featured']
        navigations.extend(get_navigations_by_ids(navigation_ids))

        return navigations
    else:
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
