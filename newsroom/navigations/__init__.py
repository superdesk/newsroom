import superdesk
from flask import Blueprint
from flask_babel import gettext

from .navigations import NavigationsResource, NavigationsService

blueprint = Blueprint('navigations', __name__)

from . import views   # noqa


def init_app(app):
    superdesk.register_resource('navigations', NavigationsResource, NavigationsService, _app=app)
    app.settings_app('navigations', gettext('Navigation'), weight=300, data=views.get_settings_data)
