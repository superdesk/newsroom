import superdesk
from .resource import APIFormattersResource
from .service import APIFormattersService
import logging

logger = logging.getLogger(__name__)


def init_app(app):
    if app.config.get('NEWS_API_ENABLED'):
        superdesk.register_resource('formatters', APIFormattersResource, APIFormattersService, _app=app)
