from flask import Blueprint
import superdesk
from .users import UsersResource, UsersService

blueprint = Blueprint('users', __name__)


def init_app(app):
    superdesk.register_resource('users', UsersResource, UsersService, _app=app)


from . import views  # noqa
