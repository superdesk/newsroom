from flask import Blueprint
from flask_babel import lazy_gettext
import superdesk
from .monitoring import MonitoringResource, MonitoringService
from .search import MonitoringSearchResource, MonitoringSearchService
from .formatters.pdf_formatter import MonitoringPDFFormatter
from .formatters.rtf_formatter import MonitoringRTFFormatter
from .utils import get_keywords_in_text

from newsroom.monitoring import email_alerts  # noqa

blueprint = Blueprint('monitoring', __name__)

from . import views # noqa


def init_app(app):
    superdesk.register_resource('monitoring', MonitoringResource, MonitoringService, _app=app)
    app.section('monitoring', 'Monitoring', 'monitoring', 'wire')
    app.settings_app('monitoring', lazy_gettext('Monitoring'), weight=200, data=views.get_settings_data)
    app.sidenav('Monitoring', 'monitoring.index', 'monitoring', section='monitoring')
    app.sidenav(lazy_gettext('Saved/Watched Items'), 'monitoring.bookmarks', 'bookmark',
                group=1, blueprint='monitoring', badge='saved-items-count')

    app.download_formatter('monitoring_pdf', MonitoringPDFFormatter(), lazy_gettext('PDF'), ['monitoring'])
    app.download_formatter('monitoring_rtf', MonitoringRTFFormatter(), lazy_gettext('RTF'), ['monitoring'])

    superdesk.register_resource('monitoring_search',
                                MonitoringSearchResource,
                                MonitoringSearchService,
                                _app=app)

    app.add_template_global(get_keywords_in_text, 'get_keywords_in_text')
    app.add_template_global(app.theme_folder, 'monitoring_image_path')
