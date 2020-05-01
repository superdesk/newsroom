from newsroom import Resource


class NewsAPISearchResource(Resource):
    resource_title = 'News Search'
    datasource = {
        'search_backend': 'elastic',
        'source': 'items',
    }
    resource_methods = ['GET']
