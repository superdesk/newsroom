from flask import Blueprint
import superdesk
from .users import UsersResource, UsersService

blueprint = Blueprint('users', __name__)


def init_app(app):
    superdesk.register_resource('users', UsersResource, UsersService, _app=app)
    app.add_template_global(views.get_view_data, 'get_user_profile_data')


from . import views  # noqa
