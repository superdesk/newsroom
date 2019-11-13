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

from eve.io.mongo import MongoJSONEncoder

from superdesk.storage import AmazonMediaStorage, SuperdeskGridFSMediaStorage
from superdesk.datalayer import SuperdeskDataLayer
from newsroom.auth import SessionAuth
from flask_mail import Mail
from flask_cache import Cache

from newsroom.settings import SettingsApp
from newsroom.utils import is_json_request
from newsroom.webpack import NewsroomWebpack
from newsroom.notifications.notifications import get_initial_notifications
from newsroom.limiter import limiter
from newsroom.template_filters import (
    datetime_short, datetime_long, time_short, date_short,
    plain_text, word_count, char_count, newsroom_config, is_admin,
    hash_string, date_header, get_date, get_multi_line_message,
    sidenavs_by_names, sidenavs_by_group, get_company_sidenavs, is_admin_or_account_manager
)
from newsroom.celery_app import init_celery
from newsroom.gettext import setup_babel
import newsroom
from superdesk.logging import configure_logging


NEWSROOM_DIR = os.path.abspath(os.path.dirname(__file__))


class Newsroom(eve.Eve):
    """The main Newsroom object.

    Usage::

        from newsroom import Newsroom

        app = Newsroom(__name__)
        app.run()
    """

    def __init__(self, import_name=__package__, config=None, testing=False, **kwargs):
        """Override __init__ to do Newsroom specific config and still be able
        to create an instance using ``app = Newsroom()``
        """
        self.sidenavs = []
        self.settings_apps = []
        self.download_formatters = {}
        self.extensions = {}
        self.theme_folder = 'theme'
        self.sections = []
        self.dashboards = []
        self._testing = testing
        self._general_settings = {}

        app_config = flask.Config(NEWSROOM_DIR)
        app_config.from_object('content_api.app.settings')
        app_config.from_pyfile(os.path.join(NEWSROOM_DIR, 'default_settings.py'), silent=True)

        # get content api default conf

        if config:
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
        self._setup_jinja()
        self._setup_limiter()
        self._setup_babel()
        init_celery(self)
        newsroom.app = self
        self._setup_blueprints(self.config['BLUEPRINTS'])
        self._setup_apps(self.config['CORE_APPS'])
        self._setup_apps(self.config.get('INSTALLED_APPS', []))
        self._setup_webpack()
        self._setup_email()
        self._setup_cache()
        self._setup_error_handlers()
        self._setup_theme()
        configure_logging(app_config.get('LOG_CONFIG_FILE'))

    def load_config(self):
        # Override Eve.load_config in order to get default_settings
        super(Newsroom, self).load_config()
        self.config.from_envvar('NEWSROOM_SETTINGS', silent=True)
        if not self._testing:
            try:
                self.config.from_pyfile(os.path.join(os.getcwd(), 'settings.py'))
            except FileNotFoundError:
                pass

    def _setup_blueprints(self, modules):
        """Setup configured blueprints."""
        for name in modules:
            mod = importlib.import_module(name)
            self.register_blueprint(mod.blueprint)

    def _setup_apps(self, apps):
        """Setup configured apps."""
        for name in apps:
            mod = importlib.import_module(name)
            if hasattr(mod, 'init_app'):
                mod.init_app(self)

    def _setup_babel(self):
        self.config.setdefault(
            'BABEL_TRANSLATION_DIRECTORIES',
            os.path.join(NEWSROOM_DIR, 'translations'))
        # avoid events on this
        self.babel_tzinfo = None
        self.babel_locale = None
        self.babel_translations = None
        setup_babel(self)

    def _setup_jinja(self):
        self.add_template_filter(datetime_short)
        self.add_template_filter(datetime_long)
        self.add_template_filter(date_header)
        self.add_template_filter(plain_text)
        self.add_template_filter(time_short)
        self.add_template_filter(date_short)
        self.add_template_filter(word_count)
        self.add_template_filter(char_count)
        self.add_template_global(get_company_sidenavs, 'sidenavs')
        self.add_template_global(sidenavs_by_names)
        self.add_template_global(sidenavs_by_group)
        self.add_template_global(is_admin_or_account_manager)
        self.add_template_global(newsroom_config)
        self.add_template_global(is_admin)
        self.add_template_global(get_initial_notifications)
        self.add_template_global(hash_string, 'hash')
        self.add_template_global(get_date, 'get_date')
        self.add_template_global(self.settings_apps, 'settings_apps')
        self.add_template_global(get_multi_line_message)
        self.jinja_loader = jinja2.ChoiceLoader([
            jinja2.FileSystemLoader('theme'),
            jinja2.FileSystemLoader(self.template_folder),
        ])

    def _setup_webpack(self):
        NewsroomWebpack(self)

    def _setup_email(self):
        self.mail = Mail(self)

    def _setup_limiter(self):
        limiter.init_app(self)

    def _setup_cache(self):
        # configuring for in-memory cache for now
        self.cache = Cache(self)

    def _setup_error_handlers(self):
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

    def _setup_theme(self):
        self.add_url_rule(
            self.static_url_path.replace('static', 'theme') + '/<path:filename>',
            endpoint='theme',
            host=self.static_host,
            view_func=self.send_theme_file
        )

    def download_formatter(self, _format, formatter, name, types):
        """Register new download formatter.

        :param _format: format id
        :param formatter: formatter class, extending :class:`newsroom.formatter.BaseFormatter` class.
        :param name: human readable name
        :param types: list of supported types, eg. ``['wire', 'agenda']``
        """
        self.download_formatters[_format] = {
            'format': _format,
            'formatter': formatter,
            'name': name,
            'types': types,
        }

    def send_theme_file(self, filename):
        if os.path.exists(os.path.join(self.theme_folder, filename)):
            return flask.send_from_directory(self.theme_folder, filename)
        return self.send_static_file(filename)

    def section(self, _id, name, group, search_type=None):
        """Define new app section.

        App sections are used for permissions in company settings,
        and for grouping products.

        You can define new sections in module :meth:`init_app` method::

            def init_app(app):
                app.section('foo', 'Foo', 'wire)

        And then you can use it in views as decorator and it will check if user
        has section active::

            from newsroom.companies import section

            @blueprint.route('/foo')
            @section('foo')
            def example():
                # user company has section foo enabled
                return flask.render_template('example_index.html)

        You can also specify ``section`` param in sidenav and it will filter out
        menu items with sections which are not enabled for company.

        :param _id: section _id
        :param name: section name
        """
        self.sections.append({
            '_id': _id,
            'name': name,
            'group': group,
            'search_type': search_type
        })

    def sidenav(self, name, endpoint=None, icon=None, group=0, section=None, blueprint=None, badge=None, url=None,
                secondary_endpoints=[]):
        """Register an item in sidebar menu.

        Use in module :meth:`init_app` method::

            def init_app(app):
                app.section('foo', 'Foo', 'wire')

        :param name: user readable name
        :param endpoint: endpoint name, used with :meth:`flask.url_for`
        :param icon: css icon class name
        :param group: group number, ``0`` by default, up to ``9``.
        :param section: section ``_id``, will be only visible if user has section enabled.
        :param blueprint: blueprint name, will be only visible if blueprint is active
        :param badge: badge id - will add badge html markup with given id
        :param url: external url - will add external link badge and use target=_blank for link
        :param secondary_endpoints: registers other endpoints (internal navigations) of a sidenav's page
        """
        if endpoint is None and url is None:
            raise ValueError('please specify endpoint or url')
        self.sidenavs.append({
            'name': name,
            'endpoint': endpoint,
            'icon': icon,
            'group': group,
            'section': section,
            'blueprint': blueprint,
            'badge': badge,
            'url': url,
            'secondary_endpoints': secondary_endpoints
        })

    def settings_app(self, app, name, weight=1000, data=None):
        self.settings_apps.append(SettingsApp(
            _id=app,
            name=name,
            data=data,
            weight=weight
        ))

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

    def dashboard(self, _id, name, cards=[]):
        """Define new dashboard

        :param _id: id of the dashboard
        :param name: display name of the dashboard
        :param cards: list of cards id related to the dashboard to
        populate the drop down in dashboard config.
        """
        self.dashboards.append({
            '_id': _id,
            'name': name,
            'cards': cards
        })
