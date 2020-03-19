from pytest import fixture, raises
from flask import session, json
from eve.utils import ParsedRequest

from content_api.errors import BadParameterValueError

from newsroom import auth  # noqa
from newsroom.search import SearchQuery, BaseSearchService
from newsroom.utils import get_local_date

from .fixtures import PUBLIC_USER_ID, ADMIN_USER_ID, TEST_USER_ID, USERS, \
    COMPANIES,\
    NAV_1, NAV_3, NAV_5, NAVIGATIONS, \
    PRODUCTS, \
    SECTION_FILTERS

service = BaseSearchService()


@fixture(autouse=True)
def init(app):
    global service
    service = BaseSearchService()

    app.data.insert('users', USERS)
    app.data.insert('companies', COMPANIES)
    app.data.insert('navigations', NAVIGATIONS)
    app.data.insert('products', PRODUCTS)
    app.data.insert('section_filters', SECTION_FILTERS)


def test_apply_section_filter(client, app):
    with app.test_request_context():
        session['user'] = ADMIN_USER_ID
        search = SearchQuery()
        service.section = 'wire'
        service.prefill_search_query(search)
        service.apply_section_filter(search)
        assert {'query_string': {
            'query': SECTION_FILTERS[0]['query'],
            'default_operator': 'AND',
            'lenient': True
        }} in search.query['bool']['must']

        service.section = 'agenda'
        service.prefill_search_query(search)
        service.apply_section_filter(search)
        assert {'query_string': {
            'query': SECTION_FILTERS[1]['query'],
            'default_operator': 'AND',
            'lenient': True
        }} in search.query['bool']['must']


def test_apply_company_filter(client, app):
    app.config['COMPANY_TYPES'] = [
        {'id': 'internal', 'wire_must': {'term': {'service.code': 'a'}}},
        {'id': 'public', 'wire_must': {'term': {'service.code': 'b'}}},
        {'id': 'test', 'wire_must_not': {'term': {'service.code': 'b'}}}
    ]

    def _set_search_query(user_id):
        with app.test_request_context():
            session['user'] = user_id
            search = SearchQuery()
            service.prefill_search_user(search)
            service.prefill_search_company(search)
            service.apply_company_filter(search)
            return search.query

    query = _set_search_query(ADMIN_USER_ID)
    assert {'term': {'service.code': 'a'}} not in query['bool']['must']
    assert query['bool']['must_not'] == []

    query = _set_search_query(PUBLIC_USER_ID)
    assert query['bool']['must_not'] == []
    assert {'term': {'service.code': 'b'}} in query['bool']['must']

    query = _set_search_query(TEST_USER_ID)
    assert query['bool']['must'] == []
    assert {'term': {'service.code': 'b'}} in query['bool']['must_not']


def test_apply_time_limit_filter(client, app):
    app.general_setting('wire_time_limit_days', 'wire_time_limit_days', default=25)

    def _set_search_query(user_id):
        with app.test_request_context():
            session['user'] = user_id
            search = SearchQuery()
            service.prefill_search_user(search)
            service.prefill_search_company(search)
            service.apply_time_limit_filter(search)
            return search.query['bool']['must']

    assert {'range': {'versioncreated': {'gte': 'now-25d/d'}}} not in _set_search_query(ADMIN_USER_ID)
    assert {'range': {'versioncreated': {'gte': 'now-25d/d'}}} not in _set_search_query(TEST_USER_ID)
    assert {'range': {'versioncreated': {'gte': 'now-25d/d'}}} in _set_search_query(PUBLIC_USER_ID)
    service.limit_days_setting = None
    assert {'range': {'versioncreated': {'gte': 'now-25d/d'}}} not in _set_search_query(PUBLIC_USER_ID)


def test_apply_products_filter(client, app):
    def assert_products_query(user_id, args=None, products=None):
        with app.test_request_context():
            session['user'] = user_id
            search = SearchQuery()

            if args is None:
                service.prefill_search_query(search)
            else:
                req = ParsedRequest()
                req.args = args
                service.prefill_search_query(search, req)

            service.apply_products_filter(search)

        for product in products:
            if product.get('query'):
                assert {'query_string': {
                    'query': product['query'],
                    'default_operator': 'AND',
                    'lenient': True
                }} in search.query['bool']['should']

        sd_product_ids = [
            product['sd_product_id']
            for product in products
            if product.get('sd_product_id')
        ]

        if len(sd_product_ids):
            assert {'terms': {'products.code': sd_product_ids}} in search.query['bool']['should']

    with app.test_request_context():
        # Admin has access to everything by default
        assert_products_query(ADMIN_USER_ID, None, [])
        # Filter results by navigation
        assert_products_query(ADMIN_USER_ID, {'navigation': str(NAV_3)}, [PRODUCTS[1]])

        # Public user has access only to their allwed products
        assert_products_query(PUBLIC_USER_ID, None, [PRODUCTS[0], PRODUCTS[1]])
        # Filter results by navigation
        assert_products_query(PUBLIC_USER_ID, {'navigation': str(NAV_1)}, [PRODUCTS[0]])
        # Filter results by navigation, ignoring non wire navigations
        assert_products_query(PUBLIC_USER_ID, {'navigation': '{},{}'.format(NAV_1, NAV_5)}, [PRODUCTS[0]])


def test_apply_request_filter__query_string(client, app):
    with app.test_request_context():
        search = SearchQuery()
        search.args = {'q': 'Sport AND Tennis'}
        service.apply_request_filter(search)
        assert {'query_string': {
            'query': 'Sport AND Tennis',
            'default_operator': 'AND',
            'lenient': True
        }} in search.query['bool']['must']

        search.args = {
            'q': 'Sport AND Tennis',
            'default_operator': 'OR'
        }
        service.apply_request_filter(search)
        assert {'query_string': {
            'query': 'Sport AND Tennis',
            'default_operator': 'OR',
            'lenient': True
        }} in search.query['bool']['must']


def test_apply_request_filter__filters(client, app):
    with app.test_request_context():
        app.config['FILTER_BY_POST_FILTER'] = False
        app.config['FILTER_AGGREGATIONS'] = True

        search = SearchQuery()
        search.args = {'filter': json.dumps({'service': ['a']})}
        service.apply_request_filter(search)
        assert {'terms': {'service.name': ['a']}} in search.query['bool']['must']

        search = SearchQuery()
        search.args = {'filter': {'service': ['a']}}
        service.apply_request_filter(search)
        assert {'terms': {'service.name': ['a']}} in search.query['bool']['must']

        with raises(BadParameterValueError):
            search.args = {'filter': ['test']}
            service.apply_request_filter(search)

        app.config['FILTER_BY_POST_FILTER'] = False
        app.config['FILTER_AGGREGATIONS'] = False
        search = SearchQuery()
        search.args = {'filter': {'term': {'service': 'a'}}}
        service.apply_request_filter(search)
        assert {'term': {'service': 'a'}} in search.query['bool']['must']

        app.config['FILTER_BY_POST_FILTER'] = True
        app.config['FILTER_AGGREGATIONS'] = True
        search = SearchQuery()
        search.args = {'filter': {'service': ['a']}}
        service.apply_request_filter(search)
        assert {'terms': {'service.name': ['a']}} in search.source['post_filter']['bool']['must']

        app.config['FILTER_BY_POST_FILTER'] = True
        app.config['FILTER_AGGREGATIONS'] = False
        search = SearchQuery()
        search.args = {'filter': {'term': {'service': 'a'}}}
        service.apply_request_filter(search)
        assert {'term': {'service': 'a'}} in search.source['post_filter']['bool']['must']


def test_apply_request_filter__versioncreated(client, app):
    with app.test_request_context():
        app.config['FILTER_BY_POST_FILTER'] = False

        search = SearchQuery()
        search.args = {'created_from': '2020-03-27'}
        service.apply_request_filter(search)
        assert {'range': {
            'versioncreated': {
                'gte': get_local_date('2020-03-27', '00:00:00', 0)
            }
        }} in search.query['bool']['must']

        search = SearchQuery()
        search.args = {'created_to': '2020-03-27'}
        service.apply_request_filter(search)
        assert {'range': {
            'versioncreated': {
                'lte': get_local_date('2020-03-27', '23:59:59', 0)
            }
        }} in search.query['bool']['must']

        search = SearchQuery()
        search.args = {
            'created_from': '2020-03-27',
            'created_from_time': '01:12:45',
            'created_to': '2020-03-27'
        }
        service.apply_request_filter(search)
        assert {'range': {
            'versioncreated': {
                'gte': get_local_date('2020-03-27', '01:12:45', 0),
                'lte': get_local_date('2020-03-27', '23:59:59', 0)
            }
        }} in search.query['bool']['must']

        app.config['FILTER_BY_POST_FILTER'] = True

        search = SearchQuery()
        search.args = {'created_from': '2020-03-27'}
        service.apply_request_filter(search)
        assert {'range': {
            'versioncreated': {
                'gte': get_local_date('2020-03-27', '00:00:00', 0)
            }
        }} in search.source['post_filter']['bool']['must']

        search = SearchQuery()
        search.args = {'created_to': '2020-03-27'}
        service.apply_request_filter(search)
        assert {'range': {
            'versioncreated': {
                'lte': get_local_date('2020-03-27', '23:59:59', 0)
            }
        }} in search.source['post_filter']['bool']['must']

        search = SearchQuery()
        search.args = {
            'created_from': '2020-03-27',
            'created_from_time': '01:12:45',
            'created_to': '2020-03-27'
        }
        service.apply_request_filter(search)
        assert {'range': {
            'versioncreated': {
                'gte': get_local_date('2020-03-27', '01:12:45', 0),
                'lte': get_local_date('2020-03-27', '23:59:59', 0)
            }
        }} in search.source['post_filter']['bool']['must']
