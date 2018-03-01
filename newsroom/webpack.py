
import json
import requests

from flask import current_app, request
from flask_webpack import Webpack


def is_localhost():
    return request and 'localhost' in request.url


class NewsroomWebpack(Webpack):

    def init_app(self, app):
        super(NewsroomWebpack, self).init_app(app)
        if not app.config.get('DEBUG'):  # let us change debug flag later
            app.before_request(self._refresh_webpack_stats_if_debug)

    def _refresh_webpack_stats_if_debug(self):
        if current_app.debug or is_localhost():
            self._refresh_webpack_stats()

    def _set_asset_paths(self, app):
        webpack_stats = app.config['WEBPACK_MANIFEST_PATH']
        self.assets_url = app.config['WEBPACK_ASSETS_URL']

        if app.testing:
            self.assets = {}
            return

        try:
            self.assets = requests.get('{0}{1}'.format(app.config['WEBPACK_SERVER_URL'], 'manifest.json')).json()
            self.assets_url = 'http://localhost:8080/'
            return
        except requests.exceptions.ConnectionError:
            pass

        try:
            with app.open_resource(webpack_stats, 'r') as stats_json:
                self.assets = json.load(stats_json)
        except IOError:
            if request:
                raise RuntimeError(
                    "Flask-Webpack requires 'WEBPACK_MANIFEST_PATH' to be set and "
                    "it must point to a valid json file.")
