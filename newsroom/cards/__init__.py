import superdesk
from flask import Blueprint

from .cards import CardsResource, CardsService

blueprint = Blueprint('cards', __name__)


def init_app(app):
    superdesk.register_resource('cards', CardsResource, CardsService, _app=app)


from . import views   # noqa