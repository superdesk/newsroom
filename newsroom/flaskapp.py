"""
Newsroom Flask app
------------------

This module implements WSGI application extending eve.Eve
"""

import os
import eve
import importlib

from superdesk.datalayer import SuperdeskDataLayer

DEFAULT_SETTINGS = {
    'XML': False,
    'IF_MATCH': True,
    'JSON_SORT_KEYS': False,
    'DOMAIN': {},
    'X_DOMAINS': '*',
    'X_MAX_AGE': 24 * 3600,
    'X_HEADERS': ['Content-Type', 'Authorization', 'If-Match'],
    'URL_PREFIX': 'api',
    'SECRET_KEY': os.urandom(32),
}

MODULES = [
    'newsroom.news',
    'newsroom.auth',
]

NEWSROOM_DIR = os.path.abspath(os.path.dirname(__file__))


class Newsroom(eve.Eve):
    """The main Newsroom object."""

    def __init__(self, import_name=__package__, settings='settings.py',
                 **kwargs):
        super(Newsroom, self).__init__(
            import_name,
            data=SuperdeskDataLayer,
            settings=DEFAULT_SETTINGS,
            template_folder=os.path.join(NEWSROOM_DIR, 'templates'),
            static_folder=os.path.join(NEWSROOM_DIR, 'static'),
            **kwargs)
        self._setup_blueprints(MODULES)

    def _setup_blueprints(self, modules):
        for name in modules:
            mod = importlib.import_module(name)
            self.register_blueprint(mod.blueprint)
