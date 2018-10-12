import superdesk
from flask import Blueprint
from flask_babel import gettext

from .products import ProductsResource, ProductsService

blueprint = Blueprint('products', __name__)

from . import views   # noqa


def init_app(app):
    superdesk.register_resource('products', ProductsResource, ProductsService, _app=app)
    app.settings_app('products', gettext('Products'), weight=400, data=views.get_settings_data)
