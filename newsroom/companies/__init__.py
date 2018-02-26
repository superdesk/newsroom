import superdesk

from flask import Blueprint
from newsroom.auth import get_user

from .companies import CompaniesResource, CompaniesService

blueprint = Blueprint('companies', __name__)


def get_user_company(user):
    if user and user.get('company'):
        return superdesk.get_resource_service('companies').find_one(req=None, _id=user['company'])


def get_user_company_name(user=None):
    if not user:
        user = get_user()
    company = get_user_company(user)
    if company:
        return company['name']
    return ''


def init_app(app):
    superdesk.register_resource('companies', CompaniesResource, CompaniesService, _app=app)
    app.add_template_global(get_user_company_name)


from . import views   # noqa
