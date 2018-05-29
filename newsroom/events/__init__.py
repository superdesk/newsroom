import superdesk

from flask import Blueprint
from newsroom.events.events import EventsResource, EventsService
from superdesk.metadata.item import not_analyzed

blueprint = Blueprint('events', __name__)

# from . import views  # noqa


def init_app(app):
    # app.config['DOMAIN']['items']['schema'].update({
    #     'word_count': {'type': 'integer'},
    # })
    #
    # app.config['DOMAIN']['items']['schema'].update({
    #     'products': {
    #         'type': 'list',
    #         'mapping': {
    #             'type': 'object',
    #             'properties': {
    #                 'code': not_analyzed,
    #                 'name': not_analyzed
    #             }
    #         }
    #     }
    # })

    superdesk.register_resource('events', EventsResource, EventsService, _app=app)

