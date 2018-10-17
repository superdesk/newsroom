"""Settings UI module."""

import flask
from flask_babel import gettext
from newsroom.auth import admin_only

blueprint = flask.Blueprint('settings', __name__)


@blueprint.route('/settings/<app_id>')
@admin_only
def app(app_id):
    for app in flask.current_app.settings_apps:
        if app._id == app_id:
            return flask.render_template('settings.html', setting_type=app_id, data=app.data())
    flask.abort(404)


def init_app(app):
    app.settings_app('general', gettext('General'), weight=800)


class SettingsApp():

    def __init__(self, _id, name, weight=1000, data=None):
        self._id = _id
        self.name = name
        self.weight = weight
        self.data = data if data is not None else self._default_data

    def _default_data(self):
        return {}
