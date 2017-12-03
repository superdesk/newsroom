from flask import Blueprint
import superdesk
from .products import ProductsResource, ProductsService

blueprint = Blueprint('products', __name__)


def init_app(app):
    superdesk.register_resource('products', ProductsResource, ProductsService, _app=app)


from . import views   # noqa
