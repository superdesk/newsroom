from newsroom import Resource


class NewsAPIFeedResource(Resource):
    resource_title = 'News Feed'
    datasource = {
        'search_backend': 'elastic',
        'source': 'items',
    }

    item_methods = ['GET']
    resource_methods = ['GET']
