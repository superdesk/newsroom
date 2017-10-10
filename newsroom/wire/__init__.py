import superdesk

from flask import Blueprint
from newsroom.wire.search import WireSearchResource, WireSearchService

blueprint = Blueprint('wire', __name__)

from . import views  # noqa


def init_app(app):
    superdesk.register_resource('wire_search', WireSearchResource, WireSearchService, _app=app)
    app.sidenav('Wire', 'wire.index')
    app.sidenav('Bookmarks', 'wire.bookmarks')
