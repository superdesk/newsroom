from collections import defaultdict

import superdesk
from bson import ObjectId
from flask_babel import gettext

from newsroom.utils import query_resource, get_entity_dict


def get_company_saved_searches():
    """ Returns number of saved searches by company """
    results = []
    company_topics = defaultdict(int)
    companies = get_entity_dict(query_resource('companies'))
    users = get_entity_dict(query_resource('users'))
    topics = query_resource('topics')

    for topic in topics:
        company = users.get(topic.get('user', ''), {}).get('company')
        if company:
            company_topics[company] += 1

    for _id, topic_count in company_topics.items():
        results.append({
            '_id': _id,
            'name': companies.get(_id, {}).get('name'),
            'is_enabled': companies.get(_id, {}).get('is_enabled'),
            'topic_count': topic_count
        })

    sorted_results = sorted(results, key=lambda k: k['name'])
    return {'results': sorted_results, 'name': gettext('Saved searches per company')}


def get_user_saved_searches():
    """ Returns number of saved searches by user """
    results = []
    user_topics = defaultdict(int)
    companies = get_entity_dict(query_resource('companies'))
    users = get_entity_dict(query_resource('users'))
    topics = query_resource('topics')

    for topic in topics:
        company = users.get(topic.get('user', ''), {}).get('company')
        if company:
            user_topics[topic['user']] += 1

    for _id, topic_count in user_topics.items():
        results.append({
            '_id': _id,
            'name': '{} {}'.format(users.get(_id, {}).get('first_name'), users.get(_id, {}).get('last_name')),
            'is_enabled': users.get(_id, {}).get('is_enabled'),
            'company': companies.get(users.get(_id, {}).get('company', ''), {}).get('name'),
            'topic_count': topic_count
        })

    sorted_results = sorted(results, key=lambda k: k['name'])
    return {'results': sorted_results, 'name': gettext('Saved searches per user')}


def get_company_products():
    """ Returns products by company """
    results = []
    company_products = {}
    companies = get_entity_dict(query_resource('companies'))
    products = query_resource('products')

    for product in products:
        for company in product.get('companies', []):
            company_product = company_products.get(company, {})
            products = company_product.get('products', [])
            products.append(product)
            company_product['products'] = products
            company_products[company] = company_product

    for _id, details in company_products.items():
        if companies[ObjectId(_id)]:
            results.append({
                '_id': _id,
                'name': companies[ObjectId(_id)]['name'],
                'is_enabled': companies[ObjectId(_id)]['is_enabled'],
                'products': details.get('products', [])
            })

    sorted_results = sorted(results, key=lambda k: k['name'])
    return {'results': sorted_results, 'name': gettext('Products per company')}


def get_product_stories():
    """ Returns the story count per product for today, this week, this month ..."""

    results = []
    products = query_resource('products')

    for product in products:
        product_stories = {
            '_id': product['_id'],
            'name': product.get('name'),
            'is_enabled': product.get('is_enabled'),
        }
        counts = superdesk.get_resource_service('wire_search').get_product_item_report(product)
        for key, value in counts.hits['aggregations'].items():
            product_stories[key] = value['buckets'][0]['doc_count']

        results.append(product_stories)

    sorted_results = sorted(results, key=lambda k: k['name'])
    return {'results': sorted_results, 'name': gettext('Stories per product')}
