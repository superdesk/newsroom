"""
Newsroom Flask app
------------------

This module implements WSGI application extending eve.Eve
"""

import os
import eve
import importlib

from flask_babel import Babel, format_time

from superdesk.storage import AmazonMediaStorage, SuperdeskGridFSMediaStorage
from superdesk.datalayer import SuperdeskDataLayer
from content_api.tokens import SubscriberTokenAuth

from newsroom.webpack import NewsroomWebpack

NEWSROOM_DIR = os.path.abspath(os.path.dirname(__file__))


class Newsroom(eve.Eve):
    """The main Newsroom object."""

    def __init__(self, import_name=__package__, **kwargs):
        """Override __init__ to do Newsroom specific config and still be able
        to create an instance using ``app = Newsroom()``
        """
        super(Newsroom, self).__init__(
            import_name,
            data=SuperdeskDataLayer,
            auth=SubscriberTokenAuth,
            settings=os.path.join(NEWSROOM_DIR, 'default_settings.py'),
            template_folder=os.path.join(NEWSROOM_DIR, 'templates'),
            static_folder=os.path.join(NEWSROOM_DIR, 'static'),
            **kwargs)
        if self.config.get('AMAZON_CONTAINER_NAME'):
            self.media = AmazonMediaStorage(self)
        else:
            self.media = SuperdeskGridFSMediaStorage(self)
        self._setup_blueprints(self.config['BLUEPRINTS'])
        self._setup_apps(self.config['CORE_APPS'])
        self._setup_babel()
        self._setup_jinja_filters()
        self._setup_webpack()

    def load_config(self):
        """Override Eve.load_config in order to get default_settings."""
        super(Newsroom, self).load_config()
        self.config.from_envvar('NEWSROOM_SETTINGS', silent=True)

    def _setup_blueprints(self, modules):
        """Setup configured blueprints."""
        for name in modules:
            mod = importlib.import_module(name)
            self.register_blueprint(mod.blueprint)

    def _setup_apps(self, apps):
        for name in apps:
            mod = importlib.import_module(name)
            if hasattr(mod, 'init_app'):
                mod.init_app(self)

    def _setup_babel(self):
        Babel(self)

    def _setup_jinja_filters(self):
        def datetime_short(datetime):
            if datetime:
                return format_time(datetime, 'short')

        self.add_template_filter(datetime_short, 'datetime_short')

    def _setup_webpack(self):
        NewsroomWebpack(self)
