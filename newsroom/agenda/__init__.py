import superdesk

from flask import Blueprint
from flask_babel import gettext
from .agenda import AgendaResource, AgendaService
from .featured import FeaturedResource, FeaturedService
from . import formatters
from .utils import get_coverage_email_text
from newsroom.utils import url_for_agenda

blueprint = Blueprint('agenda', __name__)

from . import views  # noqa


def init_app(app):
    superdesk.register_resource('agenda', AgendaResource, AgendaService, _app=app)
    superdesk.register_resource('agenda_featured', FeaturedResource, FeaturedService, _app=app)

    app.section('agenda', 'Agenda', 'agenda')
    app.sidenav(gettext('Agenda'), 'agenda.index', 'calendar', section='agenda')
    app.sidenav(gettext('Saved/Watched Items'), 'agenda.bookmarks', 'bookmark',
                group=1, blueprint='agenda', badge='saved-items-count')

    app.download_formatter('ical', formatters.iCalFormatter(), 'iCalendar', ['agenda'])
    app.add_template_global(url_for_agenda)
    app.add_template_global(get_coverage_email_text)
    app.general_setting(
        'google_maps_styles',
        gettext('Google Maps Styles'),
        default='',
        description=gettext('Provide styles delimited by &(ampersand). For example, feature:poi|element:labels|visibility:off&transit|visibility:off. Refer to https://developers.google.com/maps/documentation/maps-static/styling for more details'),  # noqa
        client_setting=True
    )
