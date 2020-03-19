from newsroom import Resource


class NewsAPISearchResource(Resource):
    datasource = {
        'search_backend': 'elastic',
        'source': 'items',
    }

    item_methods = ['GET']
    resource_methods = ['GET']
