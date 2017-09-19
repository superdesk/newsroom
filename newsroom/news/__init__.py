import superdesk

from flask import Blueprint
from newsroom.news.search import WireSearchResource, WireSearchService

blueprint = Blueprint('news', __name__)

from . import views  # noqa


def init_app(app):
    superdesk.register_resource('wire_search', WireSearchResource, WireSearchService, _app=app)
