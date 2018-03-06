from collections import defaultdict

from bson import ObjectId
from flask import jsonify, render_template

from newsroom.auth.decorator import admin_only
from newsroom.reports import blueprint
from newsroom.utils import query_resource, get_entity_dict


@blueprint.route('/reports/company_reports', methods=['GET'])
@admin_only
def company_reports():
    return render_template('company_reports.html', setting_type="company_reports", data=None)


@blueprint.route('/reports/company/saved_searches', methods=['GET'])
@admin_only
def company_saved_searches():
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

    return jsonify({'results': results}), 200


@blueprint.route('/reports/user/saved_searches', methods=['GET'])
@admin_only
def user_saved_searches():
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
            'name': users.get(_id, {}).get('name'),
            'is_enabled': users.get(_id, {}).get('is_enabled'),
            'company': companies.get(users.get(_id, {}).get('company', ''), {}).get('name'),
            'topic_count': topic_count
        })

    return jsonify({'results': results}), 200


@blueprint.route('/reports/company/products', methods=['GET'])
@admin_only
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

    return jsonify({'results': results}), 200
