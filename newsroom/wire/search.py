
import newsroom
from flask import json
from eve.utils import ParsedRequest


class WireSearchResource(newsroom.Resource):
    datasource = {
        'search_backend': 'elastic',
        'source': 'items',
        'default_sort': [('_updated', -1)],
        'elastic_filter': {"bool": {"must_not": {"term": {"type": "composite"}}}},
    }

    item_methods = []
    resource_methods = ['GET']


class WireSearchService(newsroom.Service):
    def get(self, req, lookup):
        query = {'bool': {'must_not': {'term': {'type': 'composite'}}}}

        if req.args.get('q'):
            query['bool']['must'] = {
                'query_string': {
                    'query': req.args.get('q'),
                    'default_operator': 'AND',
                    'lenient': True,
                }
            }

        internal_req = ParsedRequest()
        internal_req.args = {'source': json.dumps({'query': query})}
        return super().get(internal_req, lookup)
