from flask import Blueprint
import superdesk
from .companies import CompaniesResource, CompaniesService

blueprint = Blueprint('companies', __name__)


def init_app(app):
    superdesk.register_resource('companies', CompaniesResource, CompaniesService, _app=app)


from . import views   # noqa