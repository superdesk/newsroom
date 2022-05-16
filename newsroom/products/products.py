from bson import ObjectId

import newsroom
import superdesk
from newsroom.utils import clean_product


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
        'planning_item_query': {
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
        'product_type': {
            'type': 'string',
            'default': 'wire'
        },
        'original_creator': newsroom.Resource.rel('users'),
        'version_creator': newsroom.Resource.rel('users'),
    }
    datasource = {
        'source': 'products',
        'default_sort': [('name', 1)]
    }
    item_methods = ['GET', 'PATCH', 'DELETE']
    resource_methods = ['GET', 'POST']
    query_objectid_as_string = True  # needed for companies/navigations lookup to work
    internal_resource = True


class ProductsService(newsroom.Service):
    pass


def _get_navigation_query(ids):
    return {'$in': [str(oid) for oid in ids]} \
        if type(ids) is list \
        else str(ids)


def get_products_by_navigation(navigation_id, product_type=None):
    lookup = {
        'is_enabled': True,
        'navigations': _get_navigation_query(navigation_id)
    }

    if product_type is not None:
        lookup['product_type'] = product_type

    return [clean_product(product) for product in superdesk.get_resource_service('products').get(req=None,
                                                                                                 lookup=lookup)]


def get_product_by_id(product_id, product_type=None, company_id=None):
    lookup = {
        '_id': ObjectId(product_id),
        'is_enabled': True
    }

    if company_id is not None:
        lookup['companies'] = str(company_id)

    if product_type is not None:
        lookup['product_type'] = product_type

    return [clean_product(product) for product in superdesk.get_resource_service('products').get(req=None,
                                                                                                 lookup=lookup)]


def get_products_by_company(company_id, navigation_id=None, product_type=None):
    """Get the list of products for a company

    :param company_id: Company Id
    :param navigation_id: Navigation Id
    :param product_type: Type of the product
    """
    lookup = {'is_enabled': True, 'companies': str(company_id)}
    if navigation_id:
        lookup['navigations'] = _get_navigation_query(navigation_id)
    if product_type:
        lookup['product_type'] = product_type

    products = [clean_product(product) for product in superdesk.get_resource_service('products').get(req=None,
                                                                                                     lookup=lookup)]
    return products


def get_products_dict_by_company(company_id):
    lookup = {'is_enabled': True, 'companies': str(company_id)}
    return [clean_product(product) for product in superdesk.get_resource_service('products').get(req=None,
                                                                                                 lookup=lookup)]
