from newsroom import Resource


class NewsAPISyndicateResource(Resource):
    resource_title = 'News Syndicate'
    datasource = {
        'search_backend': 'elastic',
        'source': 'items',
    }

    item_methods = []
    resource_methods = []
