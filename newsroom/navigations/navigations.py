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
        }
    }
    datasource = {
        'source': 'navigations',
        'default_sort': [('name', 1)]
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

    product_lookup = {'is_enabled': True}

    # TODO(tolga): this lookup is not working
    # if company_id:
    #     product_lookup['companies'] = company_id
    # products = list(superdesk.get_resource_service('products').get(req=None, lookup=product_lookup))

    products = list(superdesk.get_resource_service('products').get(req=None, lookup=product_lookup))

    # Get the navigation ids used across products
    navigation_ids = []
    [navigation_ids.extend(p.get('navigations', [])) for p in products
     if not company_id or company_id in p.get('companies', [])]

    # Get the list of navigations for navigation_ids
    navigations = list(superdesk.get_resource_service('navigations')
                       .get(req=None, lookup={'_id': {'$in': navigation_ids}, 'is_enabled': True}))

    # Create a lookup for navigations
    navigations_dict = {str(n['_id']): n for n in navigations}

    for product in products:
        # if product doesn't belong to company then ignore it
        # if user is not logged in then process all products
        if company_id and company_id not in product['companies']:
            continue

        for navigation_id in product.get('navigations', []):
            if navigation_id in navigations_dict:
                # Add list of products to the navigations
                navigation_products = navigations_dict[navigation_id].get('products', [])
                navigation_products.append(str(product['_id']))
                navigations_dict[navigation_id]['products'] = navigation_products

    return list(navigations_dict.values())
