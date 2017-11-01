from flask import Blueprint
import superdesk
from .companies import CompaniesResource, CompaniesService

blueprint = Blueprint('companies', __name__)


def get_user_company(user):
    if user and user.get('company'):
        return superdesk.get_resource_service('companies').find_one(req=None, _id=user['company'])


def init_app(app):
    superdesk.register_resource('companies', CompaniesResource, CompaniesService, _app=app)


from . import views   # noqa
