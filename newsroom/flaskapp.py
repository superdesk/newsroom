"""
Newsroom Flask app
------------------

This module implements WSGI application extending eve.Eve
"""

import os
import eve
import importlib

from superdesk.storage import AmazonMediaStorage, SuperdeskGridFSMediaStorage
from superdesk.datalayer import SuperdeskDataLayer


NEWSROOM_DIR = os.path.abspath(os.path.dirname(__file__))


class Newsroom(eve.Eve):
    """The main Newsroom object."""

    def __init__(self, import_name=__package__, settings={},
                 **kwargs):
        super(Newsroom, self).__init__(
            import_name,
            data=SuperdeskDataLayer,
            settings=settings,
            template_folder=os.path.join(NEWSROOM_DIR, 'templates'),
            static_folder=os.path.join(NEWSROOM_DIR, 'static'),
            **kwargs)
        if self.config.get('AMAZON_CONTAINER_NAME'):
            self.media = AmazonMediaStorage(self)
        else:
            self.media = SuperdeskGridFSMediaStorage(self)
        self._setup_blueprints(self.config['MODULES'])

    def load_config(self):
        super(Newsroom, self).load_config()
        self.config.from_object('newsroom.default_settings')
        self.config.from_envvar('NEWSROOM_SETTINGS', silent=True)

    def _setup_blueprints(self, modules):
        for name in modules:
            mod = importlib.import_module(name)
            self.register_blueprint(mod.blueprint)
