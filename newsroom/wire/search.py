
import newsroom
import logging

from flask import json, abort
from eve.utils import ParsedRequest
from newsroom.auth import get_user
from newsroom.companies import get_user_company

logger = logging.getLogger(__name__)


aggregations = {
    'genre': {'terms': {'field': 'genre.name'}},
    'service': {'terms': {'field': 'service.name'}},
    'subject': {'terms': {'field': 'subject.name'}},
    'urgency': {'terms': {'field': 'urgency'}},
}


class WireSearchResource(newsroom.Resource):
    datasource = {
        'search_backend': 'elastic',
        'source': 'items',
        'projection': {
            'slugline': 1,
            'headline': 1,
            'body_html': 1,
            'versioncreated': 1,
            'headline': 1,
            'nextversion': 1,
            'ancestors': 1,
        },
    }

    item_methods = ['GET']
    resource_methods = ['GET']


def get_aggregation_field(key):
    return aggregations[key]['terms']['field']


class WireSearchService(newsroom.Service):
    def get(self, req, lookup):
        query = {
            'bool': {
                'must_not': [
                    {'term': {'type': 'composite'}},
                    {'constant_score': {'filter': {'exists': {'field': 'nextversion'}}}},
                ],
                'must': [],
            }
        }

        user = get_user()
        company = get_user_company(user)
        if company and company.get('services'):
            services = [code for code, is_active in company['services'].items() if is_active]
            query['bool']['must'].append({'terms': {'service.code': services}})

        if req.args.get('q'):
            query['bool']['must'].append({
                'query_string': {
                    'query': req.args.get('q'),
                    'default_operator': 'AND',
                    'lenient': True,
                }
            })
            query['bool']['must_not'].append({'term': {'pubstatus': 'canceled'}})

        if req.args.get('bookmarks'):
            query['bool']['must'].append({
                'term': {'bookmarks': req.args['bookmarks']},
            })

        if req.args.get('service'):
            services = json.loads(req.args['service'])
            selected_services = [key for key in services if services[key]]
            if selected_services:
                query['bool']['must'].append({
                    'terms': {'service.code': selected_services},
                })

        source = {'query': query}
        source['sort'] = [{'versioncreated': 'desc'}]
        source['size'] = 25
        source['from'] = int(req.args.get('from', 0))

        if source['from'] >= 1000:
            # https://www.elastic.co/guide/en/elasticsearch/guide/current/pagination.html#pagination
            return abort(400)

        if not source['from']:  # avoid aggregations when handling pagination
            source['aggs'] = aggregations

        if req.args.get('filter'):
            filters = json.loads(req.args['filter'])
            if filters:
                source['post_filter'] = {'bool': {'must': []}}
                for key, val in filters.items():
                    if val:
                        try:
                            query = {'terms': {get_aggregation_field(key): val}}
                            source['post_filter']['bool']['must'].append(query)
                        except KeyError:
                            if key == 'versioncreated':
                                for date in val:
                                    query = {'range': {key: {'gte': date}}}
                                    source['post_filter']['bool']['must'].append(query)
                            else:
                                raise

        internal_req = ParsedRequest()
        internal_req.args = {'source': json.dumps(source)}
        return super().get(internal_req, lookup)

    def test_new_item(self, item_id, topics):
        query = {
            'bool': {
                'must_not': [
                    {'term': {'type': 'composite'}},
                    {'constant_score': {'filter': {'exists': {'field': 'nextversion'}}}},
                    {'term': {'pubstatus': 'canceled'}}
                ],
                'must': [
                    {'term': {'_id': item_id}},
                ],
            }
        }
        aggs = {
            'topics': {
                'filters': {
                    'filters': {}
                }
            }
        }

        for topic in topics:
            filter = {
                'bool': {
                    'must': [{
                        'query_string': {
                            'query': topic['query'],
                            'default_operator': 'AND',
                            'lenient': True,
                        },
                        }
                    ],
                }
            }
            aggs['topics']['filters']['filters'][str(topic['_id'])] = filter

        source = {'query': query}
        source['aggs'] = aggs
        source['size'] = 0

        req = ParsedRequest()
        req.args = {'source': json.dumps(source)}
        topic_matches = []

        try:
            search_results = super().get(req, None)

            for topic in topics:
                if search_results.hits['aggregations']['topics']['buckets'][str(topic['_id'])]['doc_count'] > 0:
                    topic_matches.append(topic['_id'])

        except Exception as exc:
            logger.error('Error in test_new_item for query: {}'.format(json.dumps(source)),
                         exc, exc_info=True)

        return topic_matches
