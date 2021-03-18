"""Settings UI module."""

import re
import copy
import flask
from flask_babel import gettext, lazy_gettext
from superdesk.utc import utcnow
from newsroom.utils import get_json_or_400, set_version_creator
from newsroom.template_filters import newsroom_config
from newsroom.decorator import admin_only


blueprint = flask.Blueprint('settings', __name__)

GENERAL_SETTINGS_LOOKUP = {'_id': 'general_settings'}


def get_settings_collection():
    return flask.current_app.data.pymongo('items').db.settings


@blueprint.route('/settings/<app_id>')
@admin_only
def app(app_id):
    for app in flask.current_app.settings_apps:
        if app._id == app_id:
            return flask.render_template('settings.html', setting_type=app_id, data=app.data())
    flask.abort(404)


@blueprint.route('/settings/general_settings', methods=['POST'])
@admin_only
def update_values():
    values = get_json_or_400()

    error = validate_general_settings(values)
    if error:
        return "", error

    updates = {'values': values}
    set_version_creator(updates)
    updates['_updated'] = utcnow()

    get_settings_collection().update_one(GENERAL_SETTINGS_LOOKUP, {'$set': updates}, upsert=True)
    flask.g.settings = None  # reset cache on update
    return flask.jsonify(updates)


def get_initial_data(setting_key=None):
    data = get_setting(setting_key=setting_key, include_audit=True)
    return data


def get_setting(setting_key=None, include_audit=False):
    if not getattr(flask.g, 'settings', None):
        values = get_settings_collection().find_one(GENERAL_SETTINGS_LOOKUP)
        settings = copy.deepcopy(flask.current_app._general_settings)
        if values:
            for key, val in values.get('values', {}).items():
                if val and settings.get(key):
                    settings[key]['value'] = val
            if include_audit:
                settings['_updated'] = values.get('_updated')
                settings['version_creator'] = values.get('version_creator')

        flask.g.settings = settings
    if setting_key:
        setting_dict = flask.g.settings.get(setting_key) or {}
        return setting_dict.get('value', setting_dict.get('default'))
    return flask.g.settings


def get_client_config():
    config = newsroom_config()
    for key, setting in (get_setting() or {}).items():
        if key not in ['_updated', 'version_creator']:
            value = setting.get('value', setting.get('default'))
            if value:
                config['client_config'][key] = value
    return config


def validate_general_settings(values):
    # validate email formats for company_expiry_alert_recipients
    email_regex = re.compile(r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)")
    fields = ['company_expiry_alert_recipients', 'coverage_request_recipients', 'system_alerts_recipients']
    for field in fields:
        field_txt = gettext('Company expiry alert recipients') if field == 'company_expiry_alert_recipients'\
                else gettext('Coverage request recipients')

        for email in (values.get(field) or '').split(','):
            if email and not email_regex.match(email.strip()):
                return gettext('{}: Email IDs not in proper format'.format(field_txt))


def init_app(app):
    app.settings_app('general-settings', lazy_gettext('General Settings'), weight=800, data=get_initial_data)
    app.add_template_global(get_setting)
    app.add_template_global(get_client_config)

    # basic settings
    app.general_setting('google_analytics', lazy_gettext('Google Analytics ID'), default=app.config['GOOGLE_ANALYTICS'])
    app.general_setting('company_expiry_alert_recipients', lazy_gettext('Company expiry alert recipients'),
                        description=lazy_gettext('Comma separated list of email addresses to which the expiration alerts of companies will be sent to.'))  # noqa
    app.general_setting('coverage_request_recipients', lazy_gettext('Coverage request recipients'),
                        description=lazy_gettext(
                            'Comma separated list of email addresses who will receive the coverage request emails.'))  # noqa
    app.general_setting('system_alerts_recipients', lazy_gettext('System alerts recipients'),
                        description=lazy_gettext(
                            'Comma separated list of email addresses who will receive system alerts.'))
    app.general_setting('monitoring_report_logo_path', lazy_gettext('Monitoring report logo image'),
                        description=lazy_gettext('Monitoring report logo image (jpg or png) for RTF reports.'))


class SettingsApp():

    def __init__(self, _id, name, weight=1000, data=None):
        self._id = _id
        self.name = name
        self.weight = weight
        self.data = data if data is not None else self._default_data

    def _default_data(self):
        return {}
