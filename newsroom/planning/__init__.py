import superdesk

from flask import Blueprint
from newsroom.planning.events import EventsResource, EventsService
from newsroom.planning.search import PlanningSearchResource, PlanningSearchService
from superdesk.metadata.item import not_analyzed

blueprint = Blueprint('events', __name__)

# from . import views  # noqa


def init_app(app):
    app.config['DOMAIN']['events']['schema'].update({
        'slugline': {
            'type': 'string',
            'index': not_analyzed
        },
    })

    app.config['DOMAIN']['events']['schema'].update({
        'event_contact_info': {
            'type': 'dict',
            'nullable': 'true',
            'index': not_analyzed
        },
    })
    superdesk.register_resource('events', EventsResource, EventsService, _app=app)
    superdesk.register_resource('planning_search', PlanningSearchResource, PlanningSearchService, _app=app)
