import superdesk
from flask import Blueprint
from .resource import NewsApiTokensResource
from .service import NewsApiTokensService

API_TOKENS = 'news_api_tokens'

blueprint = Blueprint('news_api_tokens', __name__)

from . import views  # noqa


def init_app(app):
    if app.config.get('NEWS_API_ENABLED'):
        superdesk.register_resource(API_TOKENS, NewsApiTokensResource, NewsApiTokensService, _app=app)
