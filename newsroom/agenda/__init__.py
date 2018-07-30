import superdesk

from flask import Blueprint
from newsroom.agenda.agenda import AgendaResource, AgendaService
from . import formatters

blueprint = Blueprint('agenda', __name__)

from . import views  # noqa


def init_app(app):
    # app.config['DOMAIN']['events']['schema'].update({
    #     'slugline': {
    #         'type': 'string',
    #         'index': not_analyzed
    #     },
    # })

    # app.config['DOMAIN']['events']['schema'].update({
    #     'event_contact_info': {
    #         'type': 'dict',
    #         'nullable': 'true',
    #         'index': not_analyzed
    #     },
    # })

    superdesk.register_resource('agenda', AgendaResource, AgendaService, _app=app)

    app.sidenav('Agenda', 'agenda.agenda', 'calendar')
    app.add_download_formatter('ical', formatters.iCalFormatter(), 'iCalendar', ['agenda'])
