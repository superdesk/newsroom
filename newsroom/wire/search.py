
import newsroom
from flask import json
from eve.utils import ParsedRequest
from newsroom.auth import get_user
from newsroom.companies import get_user_company


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
        'aggregations': {
            'genre': {'terms': {'field': 'genre.name'}},
            'service': {'terms': {'field': 'service.name'}},
            'subject': {'terms': {'field': 'subject.name'}},
            'urgency': {'terms': {'field': 'urgency'}},
        },
    }

    item_methods = ['GET']
    resource_methods = ['GET']


def get_aggregation_field(key):
    aggs = WireSearchResource.datasource['aggregations']
    return aggs[key]['terms']['field']


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
            query['bool']['must'].append({
                'term': {'service.code': req.args['service']},
            })

        source = {'query': query}
        source['sort'] = [{'versioncreated': 'desc'}]
        source['size'] = 25

        if req.args.get('filter'):
            filters = json.loads(req.args['filter'])
            if filters:
                source['post_filter'] = {'bool': {'must': []}}
                for key, val in filters.items():
                    if val:
                        source['post_filter']['bool']['must'].append({
                            'term': {get_aggregation_field(key): val}
                        })

        internal_req = ParsedRequest()
        internal_req.args = {'source': json.dumps(source)}
        return super().get(internal_req, lookup)
