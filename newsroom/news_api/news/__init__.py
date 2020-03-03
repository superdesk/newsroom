import superdesk
import logging
from newsroom import Resource, Service

logger = logging.getLogger(__name__)


class NewsResource(Resource):
    """
    Resource just the be a place marker in the hateoas
    """
    pass


class NewsService(Service):
    pass


def init_app(app):
    if app.config.get('NEWS_API_ENABLED'):
        superdesk.register_resource('news', NewsResource, NewsService, _app=app)
