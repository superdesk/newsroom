import os
import tzlocal

from superdesk.default_settings import (   # noqa
    VERSION,
    CONTENTAPI_MONGO_URI,
    CONTENTAPI_ELASTICSEARCH_URL,
    DATE_FORMAT,
    ELASTIC_DATE_FORMAT,
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
    'newsroom.wire',
    'newsroom.auth',
    'newsroom.users',
    'newsroom.companies',
    'newsroom.design',
]

CORE_APPS = [
    'content_api.items',
    'content_api.items_versions',
    'content_api.assets',
    'content_api.search',
    'content_api.auth',
    'content_api.users',
    'content_api.companies',
    'newsroom.wire',
    'newsroom.topics',
]

SITE_NAME = 'AAP Newsroom'

TEMPLATES_AUTO_RELOAD = True

DEFAULT_TIMEZONE = os.environ.get('DEFAULT_TIMEZONE')

if DEFAULT_TIMEZONE is None:
    DEFAULT_TIMEZONE = tzlocal.get_localzone().zone

BABEL_DEFAULT_TIMEZONE = DEFAULT_TIMEZONE

WEBPACK_MANIFEST_PATH = '/manifest.json'
WEBPACK_ASSETS_URL = 'http://localhost:8080/'

# How many days a new account can stay active before it is approved by admin
NEW_ACCOUNT_ACTIVE_DAYS = 14

# Enable CSRF protection for forms
WTF_CSRF_ENABLED = True

# Email settings
MAIL_SERVER = 'localhost'
MAIL_PORT = 25
MAIL_USE_SSL = False
MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')

#: The number of days a token is valid
RESET_PASSWORD_TOKEN_TIME_TO_LIVE = 1
#: The number of days a validation token is valid
VALIDATE_ACCOUNT_TOKEN_TIME_TO_LIVE = 1
#: default sender for superdesk emails
MAIL_DEFAULT_SENDER = MAIL_USERNAME or 'newsroom@localhost'
#: public client url - used to create links within emails etc
CLIENT_URL = 'http://localhost:5050'

MEDIA_PREFIX = os.environ.get('MEDIA_PREFIX', '')
