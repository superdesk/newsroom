"""
Newsroom Flask app
------------------

This module implements WSGI application extending eve.Eve
"""

import os

import eve
import flask
import jinja2
import importlib

from flask_babel import Babel
from eve.io.mongo import MongoJSONEncoder

from superdesk.storage import AmazonMediaStorage, SuperdeskGridFSMediaStorage
from superdesk.datalayer import SuperdeskDataLayer
from newsroom.auth import SessionAuth
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cache import Cache

from newsroom.webpack import NewsroomWebpack
from newsroom.notifications.notifications import get_initial_notifications
from newsroom.template_filters import (
    datetime_short, datetime_long, time_short, date_short,
    plain_text, word_count, newsroom_config, is_admin,
    hash_string, date_header, get_date
)

NEWSROOM_DIR = os.path.abspath(os.path.dirname(__file__))


class Newsroom(eve.Eve):
    """The main Newsroom object."""

    def __init__(self, import_name=__package__, config=None, **kwargs):
        """Override __init__ to do Newsroom specific config and still be able
        to create an instance using ``app = Newsroom()``
        """
        self.sidenavs = []
        self.download_formatters = {}
        self.extensions = {}
        self.theme_folder = 'theme'

        app_config = os.path.join(NEWSROOM_DIR, 'default_settings.py')

        # get content api default conf

        if config:
            app_config = flask.Config(app_config)
            app_config.from_object('content_api.app.settings')
            app_config.update(config)

        super(Newsroom, self).__init__(
            import_name,
            data=SuperdeskDataLayer,
            auth=SessionAuth,
            settings=app_config,
            template_folder=os.path.join(NEWSROOM_DIR, 'templates'),
            static_folder=os.path.join(NEWSROOM_DIR, 'static'),
            json_encoder=MongoJSONEncoder,
            **kwargs)
        self.json_encoder = MongoJSONEncoder
        if self.config.get('AMAZON_CONTAINER_NAME'):
            self.media = AmazonMediaStorage(self)
        else:
            self.media = SuperdeskGridFSMediaStorage(self)
        self._setup_limiter()
        self._setup_blueprints(self.config['BLUEPRINTS'])
        self._setup_apps(self.config['CORE_APPS'])
        self._setup_babel()
        self._setup_jinja()
        self._setup_webpack()
        self._setup_email()
        self._setup_cache()
        self._setup_error_handlers()
        self._setup_theme()

    def load_config(self):
        """Override Eve.load_config in order to get default_settings."""
        super(Newsroom, self).load_config()
        self.config.from_envvar('NEWSROOM_SETTINGS', silent=True)
        try:
            self.config.from_pyfile(os.path.join(os.getcwd(), 'settings.py'))
        except FileNotFoundError:
            pass

    def _setup_blueprints(self, modules):
        """Setup configured blueprints."""
        for name in modules:
            mod = importlib.import_module(name)
            if name != 'newsroom.auth':
                self.limiter.exempt(mod.blueprint)
            self.register_blueprint(mod.blueprint)

    def _setup_apps(self, apps):
        for name in apps:
            mod = importlib.import_module(name)
            if hasattr(mod, 'init_app'):
                mod.init_app(self)

    def _setup_babel(self):
        # avoid events on this
        self.babel_tzinfo = None
        self.babel_locale = None
        self.babel_translations = None
        Babel(self)

    def _setup_jinja(self):
        self.add_template_filter(datetime_short)
        self.add_template_filter(datetime_long)
        self.add_template_filter(date_header)
        self.add_template_filter(plain_text)
        self.add_template_filter(time_short)
        self.add_template_filter(date_short)
        self.add_template_filter(word_count)
        self.add_template_global(self.sidenavs, 'sidenavs')
        self.add_template_global(newsroom_config)
        self.add_template_global(is_admin)
        self.add_template_global(get_initial_notifications)
        self.add_template_global(hash_string, 'hash')
        self.add_template_global(get_date, 'get_date')
        self.jinja_loader = jinja2.ChoiceLoader([
            jinja2.FileSystemLoader('theme'),
            jinja2.FileSystemLoader(self.template_folder),
        ])

    def _setup_webpack(self):
        NewsroomWebpack(self)

    def _setup_email(self):
        self.mail = Mail(self)

    def _setup_limiter(self):
        self.limiter = Limiter(self, key_func=get_remote_address)

    def _setup_cache(self):
        # configuring for in-memory cache for now
        self.cache = Cache(self)

    def _setup_error_handlers(self):
        def assertion_error(err):
            return flask.jsonify({'error': err.args[0] if err.args else 1}), 400

        self.register_error_handler(AssertionError, assertion_error)

    def _setup_theme(self):
        self.add_url_rule(
            self.static_url_path.replace('static', 'theme') + '/<path:filename>',
            endpoint='theme',
            host=self.static_host,
            view_func=self.send_theme_file
        )

    def sidenav(self, name, endpoint, icon=None):
        """Register an item in sidebar menu."""
        self.sidenavs.append({'name': name, 'endpoint': endpoint, 'icon': icon})

    def add_download_formatter(self, _format, formatter, name):
        self.download_formatters[_format] = {
            'format': _format,
            'formatter': formatter,
            'name': name,
        }

    def send_theme_file(self, filename):
        if os.path.exists(os.path.join(self.theme_folder, filename)):
            return flask.send_from_directory(self.theme_folder, filename)
        return self.send_static_file(filename)
