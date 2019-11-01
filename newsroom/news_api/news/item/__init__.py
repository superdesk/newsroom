import superdesk
import logging
from superdesk.services import BaseService
from superdesk.resource import Resource

logger = logging.getLogger(__name__)


class ItemResource(Resource):
    """
    Resource just the be a place marker in the hateoas
    """
    endpoint_name = 'news/item'


class ItemService(BaseService):
    pass


def init_app(app):
    if app.config.get('NEWS_API_ENABLED'):
        superdesk.register_resource('news/item', ItemResource, ItemService, _app=app)
