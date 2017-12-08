import newsroom


class NavigationsResource(newsroom.Resource):
    """
    Navigations schema
    """
    schema = {
        'name': {
            'type': 'string',
            'unique': True,
            'required': True
        },
        'description': {
            'type': 'string'
        },
        'is_enabled': {
            'type': 'boolean',
            'default': True
        }
    }
    datasource = {
        'source': 'navigations',
        'default_sort': [('name', 1)]
    }
    item_methods = ['GET', 'PATCH', 'DELETE']
    resource_methods = ['GET', 'POST']


class NavigationsService(newsroom.Service):
    pass
