import os
import arrow
import flask
import hashlib

from flask import current_app as app
from eve.utils import str_to_date
from flask_babel import format_time, format_date, format_datetime
from superdesk import get_resource_service
from superdesk.text_utils import get_text, get_word_count, get_char_count
from superdesk.utc import utcnow
from newsroom.auth import get_user


def to_json(value):
    """Jinja filter to address the encoding of special values to json"""
    return app.json_encoder().dumps(value)


def parse_date(datetime):
    """Return datetime instance for datetime."""
    if isinstance(datetime, str):
        try:
            return str_to_date(datetime)
        except ValueError:
            return arrow.get(datetime).datetime
    return datetime


def datetime_short(datetime):
    if datetime:
        return format_datetime(parse_date(datetime), 'short')


def datetime_long(datetime):
    if datetime:
        return format_datetime(parse_date(datetime), "dd/MM/yyyy HH:mm")


def date_header(datetime):
    return format_datetime(parse_date(datetime if datetime else utcnow()), 'EEEE, MMMM d, yyyy')


def time_short(datetime):
    if datetime:
        return format_time(parse_date(datetime), 'HH:mm')


def date_short(datetime):
    if datetime:
        return format_date(parse_date(datetime), 'short')


def plain_text(html):
    return get_text(html, content='html', lf_on_block=True) if html else ''


def word_count(html):
    return get_word_count(html or '')


def char_count(html):
    return get_char_count(html or '')


def is_admin(user=None):
    if user:
        return user.get('user_type') == 'administrator'
    return flask.session.get('user_type') == 'administrator'


def is_admin_or_internal(user=None):
    allowed_user_types = ['administrator', 'internal', 'account_management']
    if user:
        return user.get('user_type') in allowed_user_types
    return flask.session.get('user_type') in allowed_user_types


def newsroom_config():
    port = int(os.environ.get('PORT', '5000'))
    return {
        'websocket': os.environ.get('NEWSROOM_WEBSOCKET_URL', 'ws://localhost:%d' % (port + 100, )),
        'client_config': flask.current_app.config['CLIENT_CONFIG'],
    }


def hash_string(value):
    """Return SHA256 hash for given string value."""
    return hashlib.sha256(str(value).encode('utf-8')).hexdigest()


def get_date():
    return utcnow()


def sidenavs(blueprint=None):
    def blueprint_matches(nav, blueprint):
        return not nav.get('blueprint') or not blueprint or nav['blueprint'] == blueprint

    return [nav for nav in app.sidenavs if blueprint_matches(nav, blueprint)]


def section_allowed(nav, sections):
    return not nav.get('section') or sections.get(nav['section'])


def get_company_sidenavs(blueprint=None):
    user = get_user()
    company = None
    if user and user.get('company'):
        company = get_resource_service('companies').find_one(req=None, _id=user['company'])
    navs = sidenavs(blueprint)
    if company and company.get('sections'):
        return [nav for nav in navs if section_allowed(nav, company['sections'])]
    return navs


def sidenavs_by_names(names=[], blueprint=None):
    blueprint_navs = get_company_sidenavs(blueprint)
    return [nav for nav in blueprint_navs if nav.get('name') in names]


def sidenavs_by_group(group=0, blueprint=None):
    blueprint_navs = get_company_sidenavs(blueprint)
    return [nav for nav in blueprint_navs if nav.get('group') == group]


def is_admin_or_account_manager(user=None):
    allowed_user_types = ['administrator', 'account_management']
    if user:
        return user.get('user_type') in allowed_user_types
    return flask.session.get('user_type') in allowed_user_types


def get_multi_line_message(message):
    new_message = message.replace('\r', '')
    return new_message.replace('\n', '\r\n')
