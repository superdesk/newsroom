import os

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
]
