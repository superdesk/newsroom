from newsroom.wire.search import WireSearchResource, WireSearchService


class FactCheckSearchResource(WireSearchResource):
    pass


class FactCheckSearchService(WireSearchService):
    section = 'factcheck'
