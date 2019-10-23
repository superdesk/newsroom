from flask import Blueprint
from flask_babel import gettext
import superdesk
from .watch_lists import WatchListsResource, WatchListsService

blueprint = Blueprint('watch_lists', __name__)

from . import views # noqa


def init_app(app):
    superdesk.register_resource('watch_lists', WatchListsResource, WatchListsService, _app=app)
    app.section('watch_lists', 'Watch Lists', 'watch_lists', 'wire')
    app.settings_app('watch_lists', gettext('Watch Lists'), weight=200, data=views.get_settings_data)
