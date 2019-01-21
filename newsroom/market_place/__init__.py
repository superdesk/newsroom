import superdesk
from flask import Blueprint
from flask_babel import gettext

SECTION_ID = 'aapX'
SECTION_NAME = gettext('aapX')

from .search import MarketPlaceSearchResource, MarketPlaceSearchService  # noqa

blueprint = Blueprint(SECTION_ID, __name__)

from . import views  # noqa


def init_app(app):
    superdesk.register_resource('{}_search'.format(SECTION_ID),
                                MarketPlaceSearchResource,
                                MarketPlaceSearchService,
                                _app=app)

    app.dashboard(SECTION_ID, SECTION_NAME, ['6-navigation-row'])
    app.section(SECTION_ID, SECTION_NAME)

    app.sidenav(SECTION_NAME, '{}.home'.format(SECTION_ID),
                'aapX', section=SECTION_ID, secondary_endpoints=['{}.index'.format(SECTION_ID)])

    app.sidenav('Saved Items', '{}.bookmarks'.format(SECTION_ID), 'bookmark',
                group=1, blueprint=SECTION_ID, badge='saved-items-count')
