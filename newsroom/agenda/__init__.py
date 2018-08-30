import superdesk

from flask import Blueprint, url_for
from newsroom.agenda.agenda import AgendaResource, AgendaService
from . import formatters

blueprint = Blueprint('agenda', __name__)

from . import views  # noqa


def url_for_agenda(item, _external=True):
    """Get url for agenda item."""
    return url_for('agenda.item', _id=item['_id'], _external=_external)


def init_app(app):
    superdesk.register_resource('agenda', AgendaResource, AgendaService, _app=app)
    app.section('agenda', 'Agenda')
    app.sidenav('Agenda', 'agenda.index', 'calendar', section='agenda')
    app.sidenav('Saved Items', 'agenda.bookmarks', 'bookmark', group=1, blueprint='agenda', badge='saved-items-count')

    app.download_formatter('ical', formatters.iCalFormatter(), 'iCalendar', ['agenda'])
    app.add_template_global(url_for_agenda)
