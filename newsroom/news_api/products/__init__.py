import superdesk
from .resource import NewsAPIProductsResource, NewsAPIProductsService


def init_app(app):
    superdesk.register_resource('newsapi_products', NewsAPIProductsResource, NewsAPIProductsService, _app=app)
