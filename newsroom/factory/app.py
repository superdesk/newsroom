"""
Newsroom Flask app
------------------

This module implements WSGI application extending eve.Eve
"""

import os

import eve
import flask
import importlib

from eve.io.mongo import MongoJSONEncoder

from superdesk.storage import AmazonMediaStorage, SuperdeskGridFSMediaStorage
from superdesk.datalayer import SuperdeskDataLayer
from newsroom.auth import SessionAuth
from flask_mail import Mail
from flask_cache import Cache

from newsroom.utils import is_json_request
from newsroom.gettext import setup_babel
import newsroom
from superdesk.logging import configure_logging


NEWSROOM_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


class NewsroomApp(eve.Eve):
    """The base Newsroom object.

    Usage::

        from newsroom.web import NewsroomWebApp

        app = NewsroomWebApp(__name__)
        app.run()
    """

    DATALAYER = SuperdeskDataLayer
    AUTH_SERVICE = SessionAuth

    def __init__(self, import_name=__package__, config=None, testing=False, **kwargs):
        """Override __init__ to do Newsroom specific config and still be able
        to create an instance using ``app = Newsroom()``
        """

        self._testing = testing
        self._general_settings = {}
        self.babel_tzinfo = None
        self.babel_locale = None
        self.babel_translations = None
        self.mail = None
        self.cache = None

        super(NewsroomApp, self).__init__(
            import_name,
            data=self.DATALAYER,
            auth=self.AUTH_SERVICE,
            template_folder=os.path.join(NEWSROOM_DIR, 'templates'),
            static_folder=os.path.join(NEWSROOM_DIR, 'static'),
            json_encoder=MongoJSONEncoder,
            **kwargs
        )
        self.json_encoder = MongoJSONEncoder

        if config:
            try:
                self.config.update(config or {})
            except TypeError:
                self.config.from_object(config)

        newsroom.flask_app = self
        self.settings = self.config

        self.setup_media_storage()
        self.setup_babel()
        self.setup_blueprints(self.config['BLUEPRINTS'])
        self.setup_apps(self.config['CORE_APPS'])
        self.setup_apps(self.config.get('INSTALLED_APPS', []))
        self.setup_email()
        self.setup_cache()
        self.setup_error_handlers()

        configure_logging(self.config.get('LOG_CONFIG_FILE'))

    def load_app_config(self):
        self.config.from_object('content_api.app.settings')
        self.config.from_object('newsroom.default_settings')
        if not self._testing:
            try:
                self.config.from_pyfile(os.path.join(os.getcwd(), 'settings.py'))
            except FileNotFoundError:
                pass

    def load_config(self):
        # Override Eve.load_config in order to get default_settings

        if not getattr(self, 'settings'):
            self.settings = flask.Config('.')

        super(NewsroomApp, self).load_config()
        self.config.setdefault('DOMAIN', {})
        self.config.setdefault('SOURCES', {})
        self.load_app_config()

    def setup_media_storage(self):
        if self.config.get('AMAZON_CONTAINER_NAME'):
            self.media = AmazonMediaStorage(self)
        else:
            self.media = SuperdeskGridFSMediaStorage(self)

    def setup_babel(self):
        self.config.setdefault(
            'BABEL_TRANSLATION_DIRECTORIES',
            os.path.join(NEWSROOM_DIR, 'translations')
        )
        # avoid events on this
        self.babel_tzinfo = None
        self.babel_locale = None
        self.babel_translations = None
        setup_babel(self)

    def setup_blueprints(self, modules):
        """Setup configured blueprints."""
        for name in modules:
            mod = importlib.import_module(name)

            if getattr(mod, 'blueprint'):
                self.register_blueprint(mod.blueprint)

    def setup_apps(self, apps):
        """Setup configured apps."""
        for name in apps:
            mod = importlib.import_module(name)
            if hasattr(mod, 'init_app'):
                mod.init_app(self)

    def setup_email(self):
        self.mail = Mail(self)

    def setup_cache(self):
        # configuring for in-memory cache for now
        self.cache = Cache(self)

    def setup_error_handlers(self):
        def assertion_error(err):
            return flask.jsonify({'error': err.args[0] if err.args else 1}), 400

        def render_404(err):
            if flask.request and is_json_request(flask.request):
                return flask.jsonify({'code': 404}), 404
            return flask.render_template('404.html'), 404

        def render_403(err):
            if flask.request and is_json_request(flask.request):
                return flask.jsonify({'code': 403, 'error': str(err), 'info': getattr(err, 'description', None)}), 403
            return flask.render_template('403.html'), 403

        self.register_error_handler(AssertionError, assertion_error)
        self.register_error_handler(404, render_404)
        self.register_error_handler(403, render_403)

    def general_setting(self, _id, label, type='text', default=None,
                        weight=0, description=None, min=None, client_setting=False):
        self._general_settings[_id] = {
            'type': type,
            'label': label,
            'weight': weight,
            'default': default,
            'description': description,
            'min': min,
            'client_setting': client_setting
        }

        if flask.g:  # reset settings cache
            flask.g.settings = None
