from newsroom.wire.search import WireSearchResource, WireSearchService


class MediaReleasesSearchResource(WireSearchResource):
    pass


class MediaReleasesSearchService(WireSearchService):
    section = 'media_releases'
    limit_days_setting = 'media_releases_time_limit_days'
