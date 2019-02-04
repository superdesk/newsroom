"""Settings UI module."""

import copy
import flask
from flask_babel import gettext
from newsroom.auth import admin_only
from newsroom.utils import get_json_or_400
from newsroom.template_filters import newsroom_config


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
    get_settings_collection().update_one(GENERAL_SETTINGS_LOOKUP, {'$set': {'values': values}}, upsert=True)
    flask.g.settings = None  # reset cache on update
    return flask.jsonify(values)


def get_setting(setting_key=None):
    if not getattr(flask.g, 'settings', None):
        values = get_settings_collection().find_one(GENERAL_SETTINGS_LOOKUP)
        settings = copy.deepcopy(flask.current_app._general_settings)
        if values:
            for key, val in values.get('values', {}).items():
                if val:
                    settings[key]['value'] = val
        flask.g.settings = settings
    if setting_key:
        setting_dict = flask.g.settings[setting_key]
        return setting_dict.get('value', setting_dict.get('default'))
    return flask.g.settings


def get_client_config():
    config = newsroom_config()
    for key, setting in (get_setting() or {}).items():
        value = setting.get('value', setting.get('default'))
        if value:
            config['client_config'][key] = value
    return config


def init_app(app):
    app.settings_app('general-settings', gettext('General Settings'), weight=800, data=get_setting)
    app.add_template_global(get_setting)
    app.add_template_global(get_client_config)

    # basic settings
    app.general_setting('google_analytics', gettext('Google Analytics ID'), default=app.config['GOOGLE_ANALYTICS'])


class SettingsApp():

    def __init__(self, _id, name, weight=1000, data=None):
        self._id = _id
        self.name = name
        self.weight = weight
        self.data = data if data is not None else self._default_data

    def _default_data(self):
        return {}
