import logging
from newsroom.wire.search import WireSearchResource, WireSearchService

logger = logging.getLogger(__name__)


class MarketPlaceSearchResource(WireSearchResource):
    pass


class MarketPlaceSearchService(WireSearchService):
    section = 'market_place'
