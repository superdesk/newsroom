from flask import Blueprint
from flask_babel import gettext
import superdesk
from .users import UsersResource, UsersService

blueprint = Blueprint('users', __name__)

from . import views  # noqa


def init_app(app):
    superdesk.register_resource('users', UsersResource, UsersService, _app=app)
    app.add_template_global(views.get_view_data, 'get_user_profile_data')
    app.settings_app('users', gettext('User Management'), weight=200, data=views.get_settings_data)
