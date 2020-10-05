import superdesk
from content_api.items import ItemsResource as ContentApiItemsResource
from content_api.items import ItemsService as ContentApiItemsService


class ItemsResource(ContentApiItemsResource):
    """
    Overload the content api items resource so we can set it to be an internal resource
    """
    internal_resource = True


class ItemsService(ContentApiItemsService):
    """
    Overload the content api items service, so we can enhance it if needed
    """
    pass


def init_app(app):
    superdesk.register_resource('items', ItemsResource, ItemsService, _app=app)
