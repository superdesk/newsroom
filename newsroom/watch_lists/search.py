import logging
from newsroom.wire.search import WireSearchResource, WireSearchService

logger = logging.getLogger(__name__)


class WatchListsSearchResource(WireSearchResource):
    pass


class WatchListsSearchService(WireSearchService):
    section = 'watch_lists'
