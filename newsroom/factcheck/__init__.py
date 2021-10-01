import superdesk
from flask import Blueprint
from flask_babel import lazy_gettext

blueprint = Blueprint('factcheck', __name__)

from .search import FactCheckSearchResource, FactCheckSearchService  # noqa
from . import views  # noqa


def init_app(app):
    superdesk.register_resource(
        'factcheck_search',
        FactCheckSearchResource,
        FactCheckSearchService,
        _app=app
    )

    app.section('factcheck', 'FactCheck', 'wire')
    app.sidenav('FactCheck', 'factcheck.index', 'fact-check', section='factcheck')

    app.sidenav(lazy_gettext('Saved/Watched Items'), 'factcheck.bookmarks', 'bookmark',
                group=1, blueprint='factcheck', badge='saved-items-count')
