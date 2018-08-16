import superdesk

from flask import Blueprint, current_app
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


def section_allowed(nav, sections):
    return not nav.get('section') or sections.get(nav['section'])


def get_company_sidenavs():
    user = get_user()
    company = get_user_company(user)
    if company and company.get('sections'):
        print('c', company['sections'])
        return [nav for nav in current_app.sidenavs if section_allowed(nav, company['sections'])]
    return current_app.sidenavs


def init_app(app):
    superdesk.register_resource('companies', CompaniesResource, CompaniesService, _app=app)
    app.add_template_global(get_user_company_name)
    app.add_template_global(get_company_sidenavs, 'sidenavs')


from . import views   # noqa
