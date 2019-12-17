import logging
from newsroom.wire.search import WireSearchResource, WireSearchService

logger = logging.getLogger(__name__)


class MonitoringSearchResource(WireSearchResource):
    pass


class MonitoringSearchService(WireSearchService):
    section = 'monitoring'
