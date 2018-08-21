import superdesk
from functools import wraps

from flask import Blueprint, abort
from newsroom.auth import get_user
from newsroom.template_filters import sidenavs

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


def get_company_sidenavs(blueprint=None):
    user = get_user()
    company = get_user_company(user)
    navs = sidenavs(blueprint)
    if company and company.get('sections'):
        return [nav for nav in navs if section_allowed(nav, company['sections'])]
    return navs


def section(_id):
    def section_decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_user()
            company = get_user_company(user)
            if company and company.get('sections') and not company['sections'].get(_id):
                abort(403)
            return f(*args, **kwargs)
        return decorated_function
    return section_decorator


def init_app(app):
    superdesk.register_resource('companies', CompaniesResource, CompaniesService, _app=app)
    app.add_template_global(get_user_company_name)
    app.add_template_global(get_company_sidenavs, 'sidenavs')


from . import views   # noqa
