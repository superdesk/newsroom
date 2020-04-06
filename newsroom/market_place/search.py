import logging
from newsroom.wire.search import WireSearchResource, WireSearchService
from newsroom.market_place import SECTION_ID

logger = logging.getLogger(__name__)


class MarketPlaceSearchResource(WireSearchResource):
    pass


class MarketPlaceSearchService(WireSearchService):
    section = SECTION_ID
    limit_days_setting = 'aapx_time_limit_days'
