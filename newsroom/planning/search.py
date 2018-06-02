import newsroom
from flask import current_app as app, json
from eve.utils import ParsedRequest


class PlanningSearchResource(newsroom.Resource):
    item_methods = ['GET']
    resource_methods = ['GET']


def _items_query():
    return {
        'bool': {
            # 'must_not': [
            #     {'term': {'type': 'composite'}},
            #     {'constant_score': {'filter': {'exists': {'field': 'nextversion'}}}},
            # ],
            'must': [{'term': {'_type': 'events'}}],
        }
    }


class PlanningSearchService(newsroom.Service):

    @property
    def elastic(self):
        return app.data.elastic

    def find_one(self, req, **lookup):
        hits = self.elastic.es.mget({'ids': [lookup[app.config['ID_FIELD']]]},
                                    app.config['CONTENTAPI_ELASTICSEARCH_INDEX'])
        hits['hits'] = {'hits': hits.pop('docs', [])}
        docs = self.elastic._parse_hits(hits, 'events')
        return docs.first()

    def get(self, req, lookup):
        query = _items_query()
        source = {'query': query}
        source['sort'] = [{'versioncreated': 'desc'}]
        source['size'] = 25
        source['from'] = int(req.args.get('from', 0))

        internal_req = ParsedRequest()
        internal_req.args = {'source': json.dumps(source)}
        return super().get(internal_req, lookup)
