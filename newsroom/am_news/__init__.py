import superdesk
from flask import Blueprint

blueprint = Blueprint('am_news', __name__)

from .search import AmNewsSearchResource, AmNewsSearchService  # noqa
from . import views  # noqa


def init_app(app):
    superdesk.register_resource('am_news_search', AmNewsSearchResource, AmNewsSearchService, _app=app)

    app.section('am_news', 'AM')
    app.sidenav('AM', 'am_news.index', 'clock', section='am_news')

    app.sidenav('Saved Items', 'am_news.bookmarks', 'bookmark',
                group=1, blueprint='am_news', badge='saved-items-count')
