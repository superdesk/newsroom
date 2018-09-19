from flask import Blueprint


blueprint = Blueprint('am_news', __name__)

from . import views  # noqa


def init_app(app):
    app.section('am_news', 'AM News')
    app.sidenav('AM News', 'am_news.index', 'am', section='am_news')

    app.sidenav('Saved Items', 'am_news.bookmarks', 'bookmark',
                group=1, blueprint='am_news', badge='saved-items-count')
