from collections import defaultdict

import superdesk
from bson import ObjectId
from flask_babel import gettext
from flask import request, send_file, current_app as newsroom_app, json
import io
import csv
from superdesk.utc import utcnow
from werkzeug.utils import secure_filename
from copy import deepcopy
from newsroom.agenda.agenda import get_date_filters
from flask import abort
from newsroom.utils import query_resource, get_entity_dict, get_items_by_id
from .content_activity import get_content_activity_report  # noqa
from eve.utils import ParsedRequest
from newsroom.news_api.api_tokens import API_TOKENS
from newsroom.news_api.utils import format_report_results


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
        if companies.get(ObjectId(_id)):
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
    section_filters = superdesk.get_resource_service('section_filters').get_section_filters_dict()

    for product in products:
        product_stories = {
            '_id': product['_id'],
            'name': product.get('name'),
            'is_enabled': product.get('is_enabled'),
        }
        counts = superdesk.get_resource_service('wire_search').get_product_item_report(product, section_filters)
        for key, value in counts.hits['aggregations'].items():
            product_stories[key] = value['buckets'][0]['doc_count']

        results.append(product_stories)

    sorted_results = sorted(results, key=lambda k: k['name'])
    return {'results': sorted_results, 'name': gettext('Stories per product')}


def get_company_report():
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
        users = list(query_resource('users', lookup={'company': ObjectId(_id)}))
        if companies.get(ObjectId(_id)):
            company = companies[ObjectId(_id)]
            results.append({
                '_id': _id,
                'name': company['name'],
                'is_enabled': company['is_enabled'],
                'products': details.get('products', []),
                'users': users,
                'company': company,
                'account_manager': company.get('account_manager'),
            })

    sorted_results = sorted(results, key=lambda k: k['name'])
    return {'results': sorted_results, 'name': gettext('Company')}


def get_subscriber_activity_report():
    args = deepcopy(request.args.to_dict())

    # Elastic query
    aggregations = {'action': {'terms': {'field': 'action', 'size': 0}}}
    must_terms = []
    source = {}

    if args.get('company'):
        must_terms.append({'term': {'company': args.get('company')}})

    if args.get('action'):
        must_terms.append({'term': {'action': args.get('action')}})

    if args.get('section'):
        must_terms.append({'term': {'section': args.get('section')}})

    date_range = get_date_filters(args)
    if date_range.get('gt') or date_range.get('lt'):
        must_terms.append({"range": {"versioncreated": date_range}})

    source['sort'] = [{'versioncreated': 'desc'}]
    if len(must_terms) > 0:
        source['query'] = {'bool': {'must': must_terms}}

    source['size'] = 25
    source['from'] = int(args.get('from', 0))
    source['aggs'] = aggregations

    if source['from'] >= 1000:
        # https://www.elastic.co/guide/en/elasticsearch/guide/current/pagination.html#pagination
        return abort(400)

    # Get the results
    results = superdesk.get_resource_service('history').fetch_history(source, args.get('export'))
    docs = results['items']
    hits = results['hits']

    # Enhance the results
    wire_ids = []
    agenda_ids = []
    company_ids = []
    user_ids = []
    for doc in docs:
        if doc.get('section') == 'agenda':
            agenda_ids.append(doc.get('item'))
        else:
            wire_ids.append(doc.get('item'))

        company_ids.append(ObjectId(doc.get('company')))
        user_ids.append(ObjectId(doc.get('user')))

    agenda_items = get_entity_dict(get_items_by_id(agenda_ids, 'agenda'))
    wire_items = get_entity_dict(get_items_by_id(wire_ids, 'items'))
    company_items = get_entity_dict(get_items_by_id(company_ids, 'companies'), True)
    user_items = get_entity_dict(get_items_by_id(user_ids, 'users'), True)

    def get_section_name(s):
        return next((sec for sec in newsroom_app.sections if sec.get('_id') == s), {}).get('name')

    for doc in docs:
        if doc.get('item') in wire_items:
            doc['item'] = {
                'item_text': wire_items[doc['item']].get('headline'),
                '_id': wire_items[doc['item']]['_id'],
                'item_href': '/{}?item={}'.format(doc['section'] if doc['section'] != 'news_api' else 'wire',
                                                  doc['item'])
            }
        elif doc.get('item') in agenda_items:
            doc['item'] = {
                'item_text': (agenda_items[doc['item']].get('name') or agenda_items[doc['item']].get('slugline')),
                '_id': agenda_items[doc['item']]['_id'],
                'item_href': '/agenda?item={}'.format(doc['item'])
            }

        if doc.get('company') in company_items:
            doc['company'] = company_items[doc.get('company')].get('name')

        if doc.get('user') in user_items:
            user = user_items[doc.get('user')]
            doc['user'] = "{0} {1}".format(user.get('first_name'), user.get('last_name'))

        doc['section'] = get_section_name(doc['section'])
        doc['action'] = doc['action'].capitalize() if doc['action'].lower() != 'api' else 'API retrieval'

    if not request.args.get('export'):
        results = {
            'results': docs,
            'name': gettext('SubscriberActivity'),
            'aggregations': hits.get('aggregations')
        }
        return results
    else:
        field_names = ['Company', 'Section', 'Item', 'Action', 'User', 'Created']
        temp_file = io.StringIO()
        attachment_filename = '%s.csv' % utcnow().strftime('%Y%m%d%H%M%S')
        writer = csv.DictWriter(temp_file, delimiter=',', fieldnames=field_names)
        writer.writeheader()
        for doc in docs:
            row = {
                'Company': doc.get('company'),
                'Section': doc.get('section'),
                'Item': (doc.get('item') or {})['item_text'],
                'Action': doc.get('action'),
                'User': doc.get('user'),
                'Created': doc.get('versioncreated').strftime('%H:%M %d/%m/%y'),
            }

            writer.writerow(row)
        temp_file.seek(0)
        mimetype = 'text/plain'
        # Creating the byteIO object from the StringIO Object
        mem = io.BytesIO()
        mem.write(temp_file.getvalue().encode('utf-8'))
        # seeking was necessary. Python 3.5.2, Flask 0.12.2
        mem.seek(0)
        temp_file.close()
        attachment_filename = secure_filename(attachment_filename)
        return send_file(mem, mimetype=mimetype, attachment_filename=attachment_filename, as_attachment=True)


def get_company_api_usage():
    args = deepcopy(request.args.to_dict())
    date_range = get_date_filters(args)

    if not date_range.get('gt') and date_range.get('lt'):
        abort(400, 'No date range specified.')

    source = {}
    must_terms = [{"range": {"created": date_range}}]
    source['query'] = {'bool': {'must': must_terms}}
    source['sort'] = [{'created': 'desc'}]
    source['size'] = 200
    source['from'] = int(args.get('from', 0))
    source['aggs'] = {"items": {
      "aggs": {
        "endpoints": {
          "terms": {
            "size": 0,
            "field": "endpoint"
          }
        }
      },
      "terms": {
        "size": 0,
        "field": "subscriber"
      }
    }}
    company_ids = [t['company'] for t in query_resource(API_TOKENS)]
    source['query']['bool']['must'].append({"terms": {"subscriber": company_ids}})
    companies = get_entity_dict(query_resource('companies', lookup={'_id': {'$in': company_ids}}), str_id=True)
    req = ParsedRequest()
    req.args = {'source': json.dumps(source)}

    if source['from'] >= 1000:
        # https://www.elastic.co/guide/en/elasticsearch/guide/current/pagination.html#pagination
        return abort(400)

    unique_endpoints = []
    search_result = superdesk.get_resource_service('api_audit').get(req, None)
    results = format_report_results(search_result, unique_endpoints, companies)

    results = {
        'results': results,
        'name': gettext('Company News API Usage'),
        'result_headers': unique_endpoints,
    }
    return results


def get_company_names(companies):
    service = superdesk.get_resource_service('companies')
    enabled_companies = []
    disabled_companies = []
    for company in companies:
        company = service.find_one(req=None, _id=company)
        if company:
            if not company.get('is_enabled'):
                disabled_companies.append(company.get('name'))
            else:
                enabled_companies.append(company.get('name'))
    return {'enabled_companies': enabled_companies, 'disabled_companies': disabled_companies}


def get_product_company():
    args = deepcopy(request.args.to_dict())
    lookup = {'_id': ObjectId(args.get('product'))} if args.get('product') else None
    products = query_resource('products', lookup=lookup)

    res = [{'_id': product.get('_id'), 'product': product.get('name'), 'companies': product.get('companies', [])} for
           product in products]

    for r in res:
        r.update(get_company_names(r.get('companies', [])))

    results = {
        'results': res,
        'name': gettext('Companies permissioned per product')
    }
    return results


def get_expired_companies():
    expired = list(superdesk.get_resource_service('companies').find(
        {'expiry_date': {'$lte': utcnow().replace(hour=0, minute=0, second=0)}}))

    results = {
        'results': expired,
        'name': gettext('Expired companies')
    }
    return results
