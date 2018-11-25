import superdesk
from flask import Blueprint
from flask_babel import gettext

from .cards import CardsResource, CardsService

blueprint = Blueprint('cards', __name__)

from . import views   # noqa


def init_app(app):
    superdesk.register_resource('cards', CardsResource, CardsService, _app=app)
    app.settings_app('cards', gettext('Dashboards'), weight=500, data=views.get_settings_data)
