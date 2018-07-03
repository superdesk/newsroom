import os
import sys
from pathlib import Path
from pytest import fixture

root = (Path(__file__).parent / '..').resolve()
sys.path.insert(0, str(root))


def update_config(conf):
    conf['CONTENTAPI_URL'] = 'http://localhost:5400'
    conf['CONTENTAPI_MONGO_DBNAME'] = 'nrtests_contentapi'
    conf['CONTENTAPI_MONGO_URI'] = get_mongo_uri('CONTENTAPI_MONGO_URI', 'nrtests_contentapi')
    conf['CONTENTAPI_ELASTICSEARCH_INDEX'] = 'nrtests_contentapi'
    conf['SERVER_NAME'] = 'localhost:5050'
    conf['WTF_CSRF_ENABLED'] = False
    conf['DEBUG'] = True
    conf['TESTING'] = True
    conf['WEBPACK_ASSETS_URL'] = None
    conf['BABEL_DEFAULT_TIMEZONE'] = 'Europe/Prague'
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


@fixture
def app():
    from flask import Config
    from newsroom import Newsroom

    cfg = Config(root)
    cfg.from_object('newsroom.default_settings')
    update_config(cfg)
    return Newsroom(config=cfg)


@fixture
def client(app):
    return app.test_client()


@fixture(autouse=True)
def setup(app):
    with app.app_context():
        app.data.init_elastic(app)
        clean_databases(app)
        yield
