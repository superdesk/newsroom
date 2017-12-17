
import pytz
import logging
import newsroom
import superdesk

from datetime import datetime, timedelta
from flask import json, abort
from eve.utils import ParsedRequest
from newsroom.auth import get_user
from newsroom.companies import get_user_company
from newsroom.products.products import get_products_by_company
from newsroom.template_filters import is_admin

logger = logging.getLogger(__name__)


aggregations = {
    'genre': {'terms': {'field': 'genre.name', 'size': 50}},
    'service': {'terms': {'field': 'service.name', 'size': 50}},
    'subject': {'terms': {'field': 'subject.name', 'size': 20}},
    'urgency': {'terms': {'field': 'urgency'}},
    'place': {'terms': {'field': 'place.name', 'size': 50}},
}


def today(offset):
    return datetime.utcnow() + timedelta(minutes=offset)


def format_date(date, offset):
    FORMAT = '%Y-%m-%d'
    if date == 'now/d':
        return today(offset).strftime(FORMAT)
    if date == 'now/w':
        _today = today(offset)
        monday = _today - timedelta(days=_today.weekday())
        return monday.strftime(FORMAT)
    if date == 'now/M':
        month = today(offset).replace(day=1)
        return month.strftime(FORMAT)
    return date


def get_local_date(date, time, offset):
    local_dt = datetime.strptime('%sT%s' % (format_date(date, offset), time), '%Y-%m-%dT%H:%M:%S')
    return pytz.utc.normalize(local_dt.replace(tzinfo=pytz.utc) + timedelta(minutes=offset))


def get_bookmarks_count(user_id):
    return superdesk.get_resource_service('wire_search').get_bookmarks_count(user_id)


class WireSearchResource(newsroom.Resource):
    datasource = {
        'search_backend': 'elastic',
        'source': 'items',
        'projection': {
            'slugline': 1,
            'headline': 1,
            'body_html': 1,
            'firstcreated': 1,
            'versioncreated': 1,
            'nextversion': 1,
            'ancestors': 1,
            'word_count': 1,
        },
    }

    item_methods = ['GET']
    resource_methods = ['GET']


def get_aggregation_field(key):
    return aggregations[key]['terms']['field']


def _set_product_query(query, company, user=None):
    """
    Checks the user for admin privileges
    If user is administrator then there's no filtering
    If user is not administrator then products apply if user has a company
    If user is not administrator and has no company then everthing will be filtered
    :param query: search query
    :param company: company
    :param user: user to check against (used for notification checking)
    If not provided session user will be checked
    """
    if user and is_admin(user):
        # check provided user
        return

    if not user and is_admin():
        # check the session user
        return

    if company:
        products = get_products_by_company(company['_id'])
        product_ids = [p['sd_product_id'] for p in products if p.get('sd_product_id')]
        query['bool']['must'].append({'bool': {'should': [{'terms': {'products.id': product_ids}}]}})

        for product in products:
            if product.get('query'):
                query['bool']['must'][0]['bool']['should'].append(_query_string(product['query']))
    else:
        # user does not belong to a company so blocking all stories
        query['bool']['must'].append({'bool': {'must': [{'terms': {'products.id': [-1]}}]}})


def _query_string(query):
    return {
        'query_string': {
            'query': query,
            'default_operator': 'AND',
            'lenient': True,
        }
    }


def _versioncreated_range(created):
    _range = {}
    offset = int(created.get('timezone_offset', '0'))
    if created.get('created_from'):
        _range['gte'] = get_local_date(created['created_from'], '00:00:00', offset)
    if created.get('created_to'):
        _range['lte'] = get_local_date(created['created_to'], '23:59:59', offset)
    return {'range': {'versioncreated': _range}}


def _filter_terms(filters):
    return [{'terms': {get_aggregation_field(key): val}} for key, val in filters.items() if val]


def _set_bookmarks_query(query, user_id):
    query['bool']['must'].append({
        'term': {'bookmarks': str(user_id)},
    })


def _items_query():
    return {
        'bool': {
            'must_not': [
                {'term': {'type': 'composite'}},
                {'constant_score': {'filter': {'exists': {'field': 'nextversion'}}}},
            ],
            'must': [],
        }
    }


class WireSearchService(newsroom.Service):
    def get_bookmarks_count(self, user_id):
        query = _items_query()
        user = get_user()
        company = get_user_company(user)
        _set_product_query(query, company)
        _set_bookmarks_query(query, user_id)
        source = {'query': query, 'size': 0}
        internal_req = ParsedRequest()
        internal_req.args = {'source': json.dumps(source)}
        return super().get(internal_req, None).count()

    def get(self, req, lookup):
        query = _items_query()
        user = get_user()
        company = get_user_company(user)
        _set_product_query(query, company)

        if req.args.get('q'):
            query['bool']['must'].append(_query_string(req.args['q']))
            query['bool']['must_not'].append({'term': {'pubstatus': 'canceled'}})

        if req.args.get('bookmarks'):
            _set_bookmarks_query(query, req.args['bookmarks'])

        if req.args.get('navigation'):
            if company:
                products = get_products_by_company(company['_id'])
                navigation_id = req.args['navigation']
                selected_products = []

                for product in products:
                    if navigation_id in product.get('navigations', []):
                        if product and product.get('query'):
                            query['bool']['must'].append(_query_string(product.get('query')))
                        if product and product.get('sd_product_id'):
                            selected_products.append(product.get('sd_product_id'))

                if selected_products:
                    query['bool']['must'].append({
                        'terms': {'products.id': selected_products}
                    })

        source = {'query': query}
        source['sort'] = [{'versioncreated': 'desc'}]
        source['size'] = 25
        source['from'] = int(req.args.get('from', 0))
        source['post_filter'] = {'bool': {'must': []}}

        if source['from'] >= 1000:
            # https://www.elastic.co/guide/en/elasticsearch/guide/current/pagination.html#pagination
            return abort(400)

        if not source['from']:  # avoid aggregations when handling pagination
            source['aggs'] = aggregations

        if req.args.get('filter'):
            filters = json.loads(req.args['filter'])
            if filters:
                source['post_filter']['bool']['must'] += _filter_terms(filters)

        if req.args.get('created_from') or req.args.get('created_to'):
            source['post_filter']['bool']['must'].append(_versioncreated_range(req.args))

        internal_req = ParsedRequest()
        internal_req.args = {'source': json.dumps(source)}
        return super().get(internal_req, lookup)

    def get_matching_topics(self, item_id, topics, users, companies):
        """
        Returns a list of topic ids matching to the given item_id
        :param item_id: item id to be tested against all topics
        :param topics: list of topics
        :param users: user_id, user dictionary
        :param companies: company_id, company dictionary
        :return:
        """
        query = {
            'bool': {
                'must_not': [
                    {'term': {'type': 'composite'}},
                    {'constant_score': {'filter': {'exists': {'field': 'nextversion'}}}},
                    {'term': {'pubstatus': 'canceled'}}
                ],
                'must': [
                    {'term': {'_id': item_id}}
                ]
            }
        }
        aggs = {
            'topics': {
                'filters': {
                    'filters': {}
                }
            }
        }

        queried_topics = []

        for topic in topics:
            query['bool']['must'] = [{'term': {'_id': item_id}}]

            user = users.get(str(topic['user']))
            if not user:
                continue

            topic_filter = {'bool': {'must': []}}

            if topic.get('query'):
                topic_filter['bool']['must'].append(_query_string(topic['query']))

            if topic.get('created'):
                topic_filter['bool']['must'].append(_versioncreated_range(dict(
                    created_from=topic['created'].get('from'),
                    created_to=topic['created'].get('to'),
                    timezone_offset=topic.get('timezone_offset', '0')
                )))

            if topic.get('filter'):
                topic_filter['bool']['must'] += _filter_terms(topic['filter'])

            company = companies.get(str(user.get('company', '')))

            # for now even if there's no active company matching for the user
            # continuing with the search
            _set_product_query(topic_filter, company, user)

            aggs['topics']['filters']['filters'][str(topic['_id'])] = topic_filter
            queried_topics.append(topic)

        source = {'query': query}
        source['aggs'] = aggs
        source['size'] = 0

        req = ParsedRequest()
        req.args = {'source': json.dumps(source)}
        topic_matches = []

        try:
            search_results = super().get(req, None)

            for topic in queried_topics:
                if search_results.hits['aggregations']['topics']['buckets'][str(topic['_id'])]['doc_count'] > 0:
                    topic_matches.append(topic['_id'])

        except Exception as exc:
            logger.error('Error in get_matching_topics for query: {}'.format(json.dumps(source)),
                         exc, exc_info=True)

        return topic_matches

    def get_items(self, item_ids):
        try:
            query = {
                'bool': {
                    'must_not': [
                        {'term': {'type': 'composite'}},
                        {'term': {'pubstatus': 'canceled'}}
                    ],
                    'must': [
                        {'terms': {'_id': item_ids}}
                    ],
                }
            }

            source = {'query': query}
            source['size'] = len(item_ids)

            req = ParsedRequest()
            req.args = {'source': json.dumps(source)}

            return super().get(req, None)

        except Exception as exc:
            logger.error('Error in get_matching_bookmarks for query: {}'.format(json.dumps(source)),
                         exc, exc_info=True)

    def get_matching_bookmarks(self, item_ids, active_users, active_companies):
        """
        Returns a list of user ids bookmarked any of the given items
        :param item_id: list of ids of items to be searched
        :param users: user_id, user dictionary
        :param companies: company_id, company dictionary
        :return:
        """
        bookmark_users = []

        search_results = self.get_items(item_ids)

        if not search_results:
            return bookmark_users

        for result in search_results.hits['hits']['hits']:
            bookmarks = result['_source'].get('bookmarks', [])
            for bookmark in bookmarks:
                user = active_users.get(bookmark)
                if user and str(user.get('company', '')) in active_companies:
                    bookmark_users.append(bookmark)

        return bookmark_users
