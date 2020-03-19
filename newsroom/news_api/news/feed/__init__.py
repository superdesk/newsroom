import superdesk
from .resource import NewsAPIFeedResource
from .service import NewsAPIFeedService


def init_app(app):
    superdesk.register_resource('news/feed', NewsAPIFeedResource, NewsAPIFeedService, _app=app)
