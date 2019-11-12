import superdesk
from .resource import NewsAPISearchResource
from .service import NewsAPISearchService


def init_app(app):
    superdesk.register_resource('news/search', NewsAPISearchResource, NewsAPISearchService, _app=app)
