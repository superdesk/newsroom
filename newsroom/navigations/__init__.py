import superdesk
from flask import Blueprint

from .navigations import NavigationsResource, NavigationsService

blueprint = Blueprint('navigations', __name__)


def init_app(app):
    superdesk.register_resource('navigations', NavigationsResource, NavigationsService, _app=app)


from . import views   # noqa