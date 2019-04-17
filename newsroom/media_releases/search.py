from newsroom.wire.search import WireSearchResource, WireSearchService


class MediaReleasesSearchResource(WireSearchResource):
    pass


class MediaReleasesSearchService(WireSearchService):
    section = 'media_releases'
