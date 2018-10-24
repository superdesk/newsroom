from newsroom.wire.search import WireSearchResource, WireSearchService


class AmNewsSearchResource(WireSearchResource):
    pass


class AmNewsSearchService(WireSearchService):
    section = 'am_news'
