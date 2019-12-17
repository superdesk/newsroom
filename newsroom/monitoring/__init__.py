from flask import Blueprint
from flask_babel import gettext
import superdesk
from .monitoring import MonitoringResource, MonitoringService
from .search import MonitoringSearchResource, MonitoringSearchService
from .formatter import MonitoringFormatter

blueprint = Blueprint('monitoring', __name__)

from . import views # noqa


def init_app(app):
    superdesk.register_resource('monitoring', MonitoringResource, MonitoringService, _app=app)
    app.section('monitoring', 'Monitoring', 'monitoring', 'wire')
    app.settings_app('monitoring', gettext('Monitoring'), weight=200, data=views.get_settings_data)
    app.sidenav('Monitoring', 'monitoring.index', 'settings', section='monitoring')
    app.sidenav(gettext('Saved/Watched Items'), 'monitoring.bookmarks', 'bookmark',
                group=1, blueprint='monitoring', badge='saved-items-count')

    app.download_formatter('monitoring', MonitoringFormatter(), gettext('Monitoring Format'), ['monitoring'])

    superdesk.register_resource('monitoring_search',
                                MonitoringSearchResource,
                                MonitoringSearchService,
                                _app=app)
