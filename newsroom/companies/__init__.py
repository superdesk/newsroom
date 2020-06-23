import superdesk
from functools import wraps

from flask import Blueprint, abort, current_app as newsroom_app, g
from flask_babel import gettext
from newsroom.auth import get_user
from .companies import CompaniesResource, CompaniesService

blueprint = Blueprint('companies', __name__)

from . import views   # noqa


def get_user_company(user):
    if user and user.get('company'):
        return superdesk.get_resource_service('companies').find_one(req=None, _id=user['company'])
    else:  # if no user passed then try to see if the session belongs to the a company
        return superdesk.get_resource_service('companies').find_one(req=None, _id=g.user) if hasattr(g,
                                                                                                     'user') else None


def get_company_sections_monitoring_data(company_id):
    """get the section configured for the company"""
    if not company_id:
        return {'userSections': newsroom_app.sections}

    company = superdesk.get_resource_service('companies').find_one(req=None, _id=company_id)

    rv = {
        'monitoring_administrator': (company or {}).get('monitoring_administrator'),
        'userSections': newsroom_app.sections,
    }
    if company and company.get('sections'):
        rv['userSections'] = [s for s in newsroom_app.sections if company.get('sections').get(s['_id'])]

    return rv


def get_user_company_name(user=None):
    if not user:
        user = get_user()
    company = get_user_company(user)
    if company:
        return company['name']
    return ''


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
    app.settings_app('companies', gettext('Company Management'), weight=100, data=views.get_settings_data)
