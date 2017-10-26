
import newsroom
from flask import json
from eve.utils import ParsedRequest


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
        }
    }

    item_methods = ['GET']
    resource_methods = ['GET']


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
                'term': {'bookmarks': req.args.get('bookmarks')},
            })

        source = {'query': query}
        source['sort'] = [{'versioncreated': 'desc'}]
        source['size'] = 25

        internal_req = ParsedRequest()
        internal_req.args = {'source': json.dumps(source)}
        return super().get(internal_req, lookup)
