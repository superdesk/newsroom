import os
import tzlocal

from superdesk.default_settings import (   # noqa
    VERSION,
    CONTENTAPI_MONGO_URI,
    CONTENTAPI_ELASTICSEARCH_URL,
    CONTENTAPI_ELASTICSEARCH_INDEX,
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
COPYRIGHT_HOLDER = 'AAP'

TEMPLATES_AUTO_RELOAD = True

DEFAULT_TIMEZONE = os.environ.get('DEFAULT_TIMEZONE')
DATE_FORMAT = '%Y-%m-%dT%H:%M:%S+0000'

if DEFAULT_TIMEZONE is None:
    DEFAULT_TIMEZONE = tzlocal.get_localzone().zone

BABEL_DEFAULT_TIMEZONE = DEFAULT_TIMEZONE

WEBPACK_MANIFEST_PATH = os.path.join(os.path.dirname(__file__), 'static', 'manifest.json')
WEBPACK_ASSETS_URL = os.environ.get('ASSETS_URL', '/static/')

# How many days a new account can stay active before it is approved by admin
NEW_ACCOUNT_ACTIVE_DAYS = 14

# Enable CSRF protection for forms
WTF_CSRF_ENABLED = True

# Email settings
MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'localhost'
MAIL_PORT = os.environ.get('MAIL_PORT') or 25
MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL') or False
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
