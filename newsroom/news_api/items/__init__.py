import superdesk
from content_api.items import ItemsResource, ItemsService


def init_app(app):
    superdesk.register_resource('items', NewsAPIItemsResource, ItemsService, _app=app)


class NewsAPIItemsResource(ItemsResource):
    """
    Overload the content api items resource so we can set it to be an internal resource
    """
    internal_resource = True
