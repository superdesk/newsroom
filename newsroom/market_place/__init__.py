import superdesk
from flask import Blueprint
from flask_babel import gettext
from .search import MarketPlaceSearchResource, MarketPlaceSearchService

blueprint = Blueprint('market_place', __name__)

from . import views  # noqa


def init_app(app):
    superdesk.register_resource('market_place_search', MarketPlaceSearchResource, MarketPlaceSearchService, _app=app)

    app.dashboard('market_place', gettext('Market Place'))
    app.section('market_place', gettext('Market Place'))

    app.sidenav('Market Place', 'market_place.home', 'Features', section='market_place')

    app.sidenav('Saved Items', 'market_place.bookmarks', 'bookmark',
                group=1, blueprint='market_place', badge='saved-items-count')
