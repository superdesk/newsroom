from flask import Blueprint
from flask_babel import gettext
import superdesk
from .watch_lists import WatchListsResource, WatchListsService
from .search import WatchListsSearchResource, WatchListsSearchService
from .formatter import WatchListFormatter

blueprint = Blueprint('watch_lists', __name__)

from . import views # noqa


def init_app(app):
    superdesk.register_resource('watch_lists', WatchListsResource, WatchListsService, _app=app)
    app.section('watch_lists', 'Watch Lists', 'watch_lists', 'wire')
    app.settings_app('watch_lists', gettext('Watch Lists'), weight=200, data=views.get_settings_data)
    app.sidenav('Watch Lists', 'watch_lists.index', 'settings', section='watch_lists')
    app.sidenav(gettext('Saved/Watched Items'), 'watch_lists.bookmarks', 'bookmark',
                group=1, blueprint='watch_lists', badge='saved-items-count')

    app.download_formatter('watch_lists', WatchListFormatter(), gettext('Watch List Format'), ['watch_lists'])

    superdesk.register_resource('watch_lists_search',
                                WatchListsSearchResource,
                                WatchListsSearchService,
                                _app=app)
