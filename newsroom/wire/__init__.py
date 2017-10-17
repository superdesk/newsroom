import superdesk

from flask import Blueprint
from flask_babel import gettext
from newsroom.wire.search import WireSearchResource, WireSearchService

blueprint = Blueprint('wire', __name__)

from . import views  # noqa


def init_app(app):
    superdesk.register_resource('wire_search', WireSearchResource, WireSearchService, _app=app)
    app.sidenav('Wire', 'wire.index')
    app.sidenav('Bookmarks', 'wire.bookmarks')

    from .formatters import TextFormatter, NITFFormatter, NewsMLG2Formatter
    app.add_download_formatter('text', TextFormatter(), gettext('Plain Text'))
    app.add_download_formatter('nitf', NITFFormatter(), 'NITF')
    app.add_download_formatter('newsmlg2', NewsMLG2Formatter(), 'NewsMLG2')
