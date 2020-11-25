import logging
from datetime import datetime, timedelta
from copy import deepcopy

from eve.utils import ParsedRequest
from flask import current_app as app, json
from superdesk import get_resource_service
from werkzeug.exceptions import Forbidden

import newsroom
from newsroom.products.products import get_products_by_navigation
from newsroom.settings import get_setting
from newsroom.template_filters import is_admin
from newsroom.utils import get_local_date, get_end_date
from newsroom.search import BaseSearchService, SearchQuery, query_string

logger = logging.getLogger(__name__)


def get_bookmarks_count(user_id, product_type):
    return get_resource_service('{}_search'.format(product_type)).get_bookmarks_count(user_id)


def get_aggregations():
    return app.config.get('WIRE_AGGS', {})


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
            'wordcount': 1,
            'charcount': 1,
        },
        'elastic_filter': {'bool': {'must': [{'term': {'_type': 'items'}}]}},
    }

    item_methods = ['GET']
    resource_methods = ['GET']


def versioncreated_range(created):
    _range = {}
    offset = int(created.get('timezone_offset', '0'))
    if created.get('created_from'):
        _range['gte'] = get_local_date(created['created_from'], created.get('created_from_time', '00:00:00'), offset)
    if created.get('created_to'):
        _range['lte'] = get_end_date(created['created_to'], get_local_date(created['created_to'], '23:59:59', offset))
    return {'range': {'versioncreated': _range}}


def set_bookmarks_query(query, user_id):
    query['bool']['must'].append({
        'term': {'bookmarks': str(user_id)},
    })


def items_query(ignore_latest=False):
    query = {
        'bool': {
            'must_not': [
                {'term': {'type': 'composite'}}
            ],
            'must': [{'term': {'_type': 'items'}}],
        }
    }

    if not ignore_latest:
        query['bool']['must_not'].append({'constant_score': {'filter': {'exists': {'field': 'nextversion'}}}})

    return query


class WireSearchService(BaseSearchService):
    section = 'wire'

    def get_bookmarks_count(self, user_id):
        req = ParsedRequest()
        req.args = {
            'bookmarks': user_id,
            'size': 0
        }

        try:
            return super().get(req, None).count()
        except Forbidden:
            return 0

    def get_items(self, item_ids, size=None, aggregations=None, apply_permissions=False):
        search = SearchQuery()

        try:
            search.query = {
                'bool': {
                    'must_not': [
                        {'term': {'type': 'composite'}},
                    ],
                    'must': [
                        {'terms': {'_id': item_ids}}
                    ],
                    'should': [],
                }
            }

            if apply_permissions:
                self.prefill_search_query(search)
                self.validate_request(search)
                self.apply_filters(search)

            search.source = {
                'query': search.query,
                'size': len(item_ids) if size is None else size,
            }

            if aggregations is not None:
                search.source['aggs'] = aggregations

            req = ParsedRequest()
            req.args = {'source': json.dumps(search.source)}

            return self.internal_get(req, None)

        except Exception as exc:
            logger.error(
                'Error in get_items for query: {}'.format(json.dumps(search.source)),
                exc,
                exc_info=True
            )

    def get_product_items(self, product_id, size):
        search = SearchQuery()
        self.prefill_search_args(search)
        self.prefill_search_items(search)
        search.args['size'] = size

        product = get_resource_service('products').find_one(req=None, _id=product_id)

        if not product:
            return

        search.query['bool']['must'].append({
            "bool": {
                "should": [
                    {"range": {"embargoed": {"lt": "now"}}},
                    {"bool": {"must_not": {"exists": {"field": "embargoed"}}}}
                ]
            }
        })

        get_resource_service('section_filters').apply_section_filter(
            search.query,
            product.get('product_type')
        )

        search.query['bool']['should'] = []

        if product.get('sd_product_id'):
            search.query['bool']['should'].append(
                {'term': {'products.code': product['sd_product_id']}}
            )

        if product.get('query'):
            search.query['bool']['should'].append(
                query_string(product['query'])
            )

        search.query['bool']['minimum_should_match'] = 1

        self.gen_source_from_search(search)
        search.source['post_filter'] = {'bool': {'must': []}}
        internal_req = self.get_internal_request(search)

        return list(self.internal_get(internal_req, None))

    def get_navigation_story_count(self, navigations, section, company, user):
        """Get story count by navigation"""

        search = SearchQuery()
        self.prefill_search_args(search)
        self.prefill_search_items(search)
        search.section = section
        search.user = user
        search.company = company
        self.apply_section_filter(search)

        aggs = {
            'navigations': {
                'filters': {
                    'filters': {}
                }
            }
        }

        for navigation in navigations:
            navigation_id = navigation.get('_id')
            products = get_products_by_navigation(navigation_id) or []
            navigation_filter = {'bool': {'should': [], 'minimum_should_match': 1}}
            for product in products:
                if product.get('query'):
                    navigation_filter['bool']['should'].append(
                        query_string(product.get('query'))
                    )

            if navigation_filter['bool']['should']:
                aggs['navigations']['filters']['filters'][str(navigation_id)] = navigation_filter

        source = {
            'query': search.query,
            'aggs': aggs,
            'size': 0
        }
        req = ParsedRequest()
        req.args = {'source': json.dumps(source)}

        try:
            results = self.internal_get(req, None)
            buckets = results.hits['aggregations']['navigations']['buckets']
            for navigation in navigations:
                navigation_id = navigation.get('_id')
                doc_count = buckets.get(str(navigation_id), {}).get('doc_count', 0)
                if doc_count > 0:
                    navigation['story_count'] = doc_count

        except Exception as exc:
            logger.error(
                'Error in get_navigation_story_count for query: {}'.format(json.dumps(source)),
                exc,
                exc_info=True
            )

    def get_matching_topics(self, item_id, topics, users, companies):
        """ Returns a list of topic ids matching to the given item_id

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
                ],
                'must': [
                    {'term': {'_id': item_id}}
                ],
                'should': []
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
        # get all section filters
        section_filters = get_resource_service('section_filters').get_section_filters_dict()

        for topic in topics:
            search = SearchQuery()

            user = users.get(str(topic['user']))
            if not user:
                continue

            search.user = user
            search.is_admin = is_admin(user)
            search.company = companies.get(str(user.get('company', '')))

            search.query = deepcopy(query)
            search.section = topic.get('topic_type')

            self.prefill_search_products(search)

            if topic.get('query'):
                search.query['bool']['must'].append(
                    query_string(topic['query'])
                )

            if topic.get('created'):
                search.query['bool']['must'].append(
                    self.versioncreated_range(dict(
                        created_from=topic['created'].get('from'),
                        created_to=topic['created'].get('to'),
                        timezone_offset=topic.get('timezone_offset', '0')
                    ))
                )

            if topic.get('filter'):
                search.query['bool']['must'].append(self._filter_terms(topic['filter']))

            # for now even if there's no active company matching for the user
            # continuing with the search
            try:
                self.validate_request(search)
                self.apply_section_filter(search, section_filters)
                self.apply_company_filter(search)
                self.apply_time_limit_filter(search)
                self.apply_products_filter(search)
            except Forbidden:
                logger.info(
                    'Notification for user:{} and topic:{} is skipped'.format(
                        user.get('_id'),
                        topic.get('_id')
                    )
                )
                continue

            aggs['topics']['filters']['filters'][str(topic['_id'])] = search.query
            queried_topics.append(topic)

        source = {'query': query}
        source['aggs'] = aggs
        source['size'] = 0

        req = ParsedRequest()
        req.args = {'source': json.dumps(source)}
        topic_matches = []

        try:
            search_results = self.internal_get(req, None)

            for topic in queried_topics:
                if search_results.hits['aggregations']['topics']['buckets'][str(topic['_id'])]['doc_count'] > 0:
                    topic_matches.append(topic['_id'])

        except Exception as exc:
            logger.error('Error in get_matching_topics for query: {}'.format(json.dumps(source)),
                         exc, exc_info=True)

        return topic_matches

    def has_permissions(self, item, ignore_latest=False):
        """Test if current user has permissions to view given item."""
        req = ParsedRequest()
        req.args = {
            'size': 0,
            'aggs': False,
            'ignore_latest': ignore_latest
        }
        try:
            results = self.get(req, {'_id': item['_id']})
            return results.count() > 0
        except Forbidden:
            return False

    def apply_request_filter(self, search):
        """ Generate the filters from request args

        :param newsroom.search.SearchQuery search: The search query instance
        """

        super().apply_request_filter(search)

        if search.args.get('bookmarks'):
            set_bookmarks_query(search.query, search.args['bookmarks'])

        if search.args.get('newsOnly') and not (search.args.get('navigation') or search.args.get('product_type')):
            news_only_filter = get_setting('news_only_filter')
            if news_only_filter:
                search.query['bool']['must_not'].append(query_string(news_only_filter))
            elif app.config.get('NEWS_ONLY_FILTERS'):
                for f in app.config.get('NEWS_ONLY_FILTERS', []):
                    search.query['bool']['must_not'].append(f)

    def get_product_item_report(self, product, section_filters=None):
        query = items_query()

        if not product:
            return

        query['bool']['should'] = []
        get_resource_service('section_filters').apply_section_filter(
            query,
            product.get('product_type'),
            section_filters
        )

        if product.get('sd_product_id'):
            query['bool']['should'].append({'term': {'products.code': product['sd_product_id']}})

        if product.get('query'):
            query['bool']['should'].append(query_string(product['query']))

        query['bool']['minimum_should_match'] = 1
        query['bool']['must_not'].append({'term': {'pubstatus': 'canceled'}})

        now = datetime.utcnow()

        source = {'query': query}
        source['size'] = 0
        source['aggs'] = {
            "today": {
                "date_range": {
                    "field": "versioncreated",
                    "ranges": [
                        {
                            "from": now.strftime('%Y-%m-%d')
                        }
                    ]
                }
            },
            "last_24_hours": {
                "date_range": {
                    "field": "versioncreated",
                    "ranges": [
                        {
                            "from": "now-1d/d"
                        }
                    ]
                }
            },
            "this_week": {
                "date_range": {
                    "field": "versioncreated",
                    "ranges": [
                        {
                            "from": (now - timedelta(days=now.weekday())).strftime('%Y-%m-%d')
                        }
                    ]
                }
            },
            "last_7_days": {
                "date_range": {
                    "field": "versioncreated",
                    "ranges": [
                        {
                            "from": (now - timedelta(days=7)).strftime('%Y-%m-%d')
                        }
                    ]
                }
            },
            "this_month": {
                "date_range": {
                    "field": "versioncreated",
                    "ranges": [
                        {
                            "from": (now.replace(day=1)).strftime('%Y-%m-%d')
                        }
                    ]
                }
            },
            "previous_month": {
                "date_range": {
                    "field": "versioncreated",
                    "ranges": [
                        {
                            "from": (((now.replace(day=1)) - timedelta(days=1)).replace(day=1)).strftime('%Y-%m-%d'),
                            "to": (now.replace(day=1)).strftime('%Y-%m-%d'),
                        }
                    ]
                }
            },
            "last_6_months": {
                "date_range": {
                    "field": "versioncreated",
                    "ranges": [
                        {
                            "from": (now - timedelta(days=180)).strftime('%Y-%m-%d')
                        }
                    ]
                }
            },
        }

        internal_req = ParsedRequest()
        internal_req.args = {'source': json.dumps(source)}
        return self.internal_get(internal_req, None)

    def get_matching_bookmarks(self, item_ids, active_users, active_companies):
        """ Returns a list of user ids bookmarked any of the given items

        :param item_ids: list of ids of items to be searched
        :param active_users: user_id, user dictionary
        :param active_companies: company_id, company dictionary
        """
        bookmark_users = []

        query = {
            'bool': {
                'must_not': [
                    {'term': {'type': 'composite'}},
                ],
                'must': [
                    {'terms': {'_id': item_ids}}
                ],
            }
        }
        get_resource_service('section_filters').apply_section_filter(query, self.section)

        source = {'query': query}
        internal_req = ParsedRequest()
        internal_req.args = {'source': json.dumps(source)}
        search_results = self.internal_get(internal_req, None)

        if not search_results:
            return bookmark_users

        for result in search_results.hits['hits']['hits']:
            bookmarks = result['_source'].get('bookmarks', [])
            for bookmark in bookmarks:
                user = active_users.get(bookmark)
                if user and str(user.get('company', '')) in active_companies:
                    bookmark_users.append(bookmark)

        return bookmark_users
