
import newsroom
from planning.events.events_schema import events_schema


class EventsResource(newsroom.Resource):
    schema = events_schema
    resource_methods = ['GET']
    datasource = {
        'source': 'events',
        'search_backend': 'elastic',
        'default_sort': [('dates.start', 1)],
    }
    item_methods = ['GET']


class EventsService(newsroom.Service):
    pass

