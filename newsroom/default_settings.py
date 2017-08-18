import os
import tzlocal

from superdesk.default_settings import (   # noqa
    VERSION,
    CONTENTAPI_MONGO_URI,
    CONTENTAPI_ELASTICSEARCH_URL
)

XML = False
IF_MATCH = True
JSON_SORT_KEYS = False
DOMAIN = {}

X_DOMAINS = '*'
X_MAX_AGE = 24 * 3600
X_HEADERS = ['Content-Type', 'Authorization', 'If-Match']

URL_PREFIX = 'api'
SECRET_KEY = os.environ.get('SECRET_KEY', os.urandom(32))

BLUEPRINTS = [
    'newsroom.news',
    'newsroom.auth',
]

CORE_APPS = [
    'content_api.items',
    'content_api.items_versions',
    'content_api.assets',
    'content_api.search',
]

SITE_NAME = 'AAP Newsroom'

TEMPLATES_AUTO_RELOAD = True

DEFAULT_TIMEZONE = os.environ.get('DEFAULT_TIMEZONE')

if DEFAULT_TIMEZONE is None:
    DEFAULT_TIMEZONE = tzlocal.get_localzone().zone

BABEL_DEFAULT_TIMEZONE = DEFAULT_TIMEZONE

WEBPACK_MANIFEST_PATH = './dist/manifest.json'
WEBPACK_ASSETS_URL = 'http://localhost:8080/assets/'
