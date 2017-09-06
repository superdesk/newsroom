import unittest
import os
from flask import Config
from newsroom import Newsroom


def update_config(conf):
    conf['CONTENTAPI_URL'] = 'http://localhost:5400'
    conf['CONTENTAPI_MONGO_DBNAME'] = 'nrtests_contentapi'
    conf['CONTENTAPI_MONGO_URI'] = get_mongo_uri('CONTENTAPI_MONGO_URI', 'nrtests_contentapi')
    conf['CONTENTAPI_ELASTICSEARCH_INDEX'] = 'nrtests_contentapi'
    conf['SERVER_NAME'] = 'localhost:5050'
    conf['WTF_CSRF_ENABLED'] = False
    conf['DEBUG'] = True
    conf['TESTING'] = True
    return conf


def get_mongo_uri(key, dbname):
    """Read mongo uri from env variable and replace dbname.

    :param key: env variable name
    :param dbname: mongo db name to use
    """
    env_uri = os.environ.get(key, 'mongodb://localhost/test')
    env_host = env_uri.rsplit('/', 1)[0]
    return '/'.join([env_host, dbname])


def clean_databases(app):
    app.data.mongo.pymongo().cx.drop_database(app.config['CONTENTAPI_MONGO_DBNAME'])
    indices = '%s*' % app.config['CONTENTAPI_ELASTICSEARCH_INDEX']
    es = app.data.elastic.es
    es.indices.delete(indices, ignore=[404])
    with app.app_context():
        app.data.init_elastic(app)


class TestCase(unittest.TestCase):
    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)

        self.app = None
        self.client = None
        self.ctx = None

    @classmethod
    def setUpClass(cls):
        """Wrap `setUp` and `tearDown` methods to run `setUpForChildren` and `tearDownForChildren`."""
        # setUp
        def wrapper(self, *args, **kwargs):
            """Combine `setUp` with `setUpForChildren`."""
            self.setUpForChildren()
            return orig_setup(self, *args, **kwargs)
        orig_setup = cls.setUp
        cls.setUp = wrapper

        # tearDown
        def wrapper(self, *args, **kwargs):
            """Combine `tearDown` with `tearDownForChildren`."""
            self.tearDownForChildren()
            return orig_teardown(self, *args, **kwargs)
        orig_teardown = cls.tearDown
        cls.tearDown = wrapper

    def setUpForChildren(self):
        """Run this `setUp` stuff for each children."""
        app_abspath = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
        cfg = Config(app_abspath)
        cfg.from_object('newsroom.default_settings')
        update_config(cfg)
        app = Newsroom(config=cfg)

        self.app = app
        self.ctx = self.app.app_context()
        self.ctx.push()
        clean_databases(app)

        def clean_ctx():
            if self.ctx:
                self.ctx.pop()
        self.addCleanup(clean_ctx)

    def tearDownForChildren(self):
        """Run this `tearDown` stuff for each children."""

    def get_fixture_path(self, filename):
        rootpath = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
        return os.path.join(rootpath, 'features', 'steps', 'fixtures', filename)
