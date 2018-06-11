
import newsroom
from planning.planning.planning import planning_schema


class PlanningResource(newsroom.Resource):
    schema = planning_schema
    resource_methods = ['GET']
    datasource = {
        'source': 'planning',
        'search_backend': 'elastic',
        'default_sort': [('dates.start', 1)],
    }
    item_methods = ['GET']


class PlanningService(newsroom.Service):
    pass
