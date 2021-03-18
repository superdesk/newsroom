import superdesk
from flask import Blueprint
from flask_babel import lazy_gettext

blueprint = Blueprint('media_releases', __name__)

from .search import MediaReleasesSearchResource, MediaReleasesSearchService  # noqa
from . import views  # noqa


def init_app(app):
    superdesk.register_resource(
        'media_releases_search',
        MediaReleasesSearchResource,
        MediaReleasesSearchService,
        _app=app
    )

    app.section('media_releases', 'Media Releases', 'wire')
    app.sidenav('Media Releases', 'media_releases.index', 'factory', section='media_releases')

    app.sidenav(lazy_gettext('Saved/Watched Items'), 'media_releases.bookmarks', 'bookmark',
                group=1, blueprint='media_releases', badge='saved-items-count')
