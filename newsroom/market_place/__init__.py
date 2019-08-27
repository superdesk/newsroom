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
    app.section(SECTION_ID, SECTION_NAME, 'wire')

    app.sidenav(SECTION_NAME, '{}.home'.format(SECTION_ID),
                'aapX', section=SECTION_ID, secondary_endpoints=['{}.index'.format(SECTION_ID)])

    app.sidenav(gettext('Saved/Watched Items'), '{}.bookmarks'.format(SECTION_ID), 'bookmark',
                group=1, blueprint=SECTION_ID, badge='saved-items-count')

    app.general_setting(
        'aapx_time_limit_days',
        gettext('Time limit for aapX items (in days)'),
        type='number',
        min=0,
        weight=300,
        description=gettext(
            "You can create an additional filter on top of the product definition. The time limit can be enabled for each company in the Permissions."),  # noqa
        default=app.config.get('AAPX_TIME_LIMIT_DAYS', 0),
    )
