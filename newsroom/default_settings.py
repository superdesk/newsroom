import os
import tzlocal

from superdesk.default_settings import (   # noqa
    VERSION,
    CONTENTAPI_MONGO_URI,
    CONTENTAPI_ELASTICSEARCH_URL,
    CONTENTAPI_ELASTICSEARCH_INDEX,
    ELASTIC_DATE_FORMAT,
    CELERY_BROKER_URL,
    celery_queue,
)

XML = False
IF_MATCH = True
JSON_SORT_KEYS = False
DOMAIN = {}

X_DOMAINS = '*'
X_MAX_AGE = 24 * 3600
X_HEADERS = ['Content-Type', 'Authorization', 'If-Match']

URL_PREFIX = 'api'

# keys for signing, shoudl be binary
SECRET_KEY = os.environ.get('SECRET_KEY', '').encode() or os.urandom(32)
PUSH_KEY = os.environ.get('PUSH_KEY', '').encode()

BLUEPRINTS = [
    'newsroom.wire',
    'newsroom.auth',
    'newsroom.users',
    'newsroom.companies',
    'newsroom.design',
    'newsroom.push',
    'newsroom.topics',
    'newsroom.upload',
]

CORE_APPS = [
    'superdesk.notification',
    'content_api.items',
    'content_api.items_versions',
    'content_api.search',
    'content_api.auth',
    'content_api.publish',
    'newsroom.users',
    'newsroom.companies',
    'newsroom.wire',
    'newsroom.topics',
    'newsroom.upload',
]

SITE_NAME = 'AAP Newsroom'
COPYRIGHT_HOLDER = 'AAP'
COPYRIGHT_NOTICE = ''
USAGE_TERMS = ''

TEMPLATES_AUTO_RELOAD = True

DEFAULT_TIMEZONE = os.environ.get('DEFAULT_TIMEZONE')
DATE_FORMAT = '%Y-%m-%dT%H:%M:%S+0000'

if DEFAULT_TIMEZONE is None:
    DEFAULT_TIMEZONE = tzlocal.get_localzone().zone

BABEL_DEFAULT_TIMEZONE = DEFAULT_TIMEZONE

WEBPACK_MANIFEST_PATH = os.path.join(os.path.dirname(__file__), 'static', 'manifest.json')
WEBPACK_ASSETS_URL = os.environ.get('ASSETS_URL', '/static/')
WEBPACK_SERVER_URL = os.environ.get('WEBPACK_SERVER_URL', 'http://localhost:8080/')

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
#: The number login attempts allowed before account is locked
MAXIMUM_FAILED_LOGIN_ATTEMPTS = 5
#: default sender for superdesk emails
MAIL_DEFAULT_SENDER = MAIL_USERNAME or 'newsroom@localhost'
# Recipients for the sign up form filled by new users (single or comma separated)
SIGNUP_EMAIL_RECIPIENTS = os.environ.get('SIGNUP_EMAIL_RECIPIENTS')

#: public client url - used to create links within emails etc
CLIENT_URL = 'http://localhost:5050'

MEDIA_PREFIX = os.environ.get('MEDIA_PREFIX', '/assets')

# Flask Limiter Settings
RATELIMIT_DEFAULT = '60/hour'
RATELIMIT_STRATEGY = 'fixed-window'
RATELIMIT_ENABLED = True

# Cache Settings
CACHE_TYPE = 'simple'  # in-memory cache
# The default timeout that is used if no timeout is specified in sec
CACHE_DEFAULT_TIMEOUT = 3600
# Redis host (used only if CACHE_TYPE is redis)
CACHE_REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')

# Recaptcha Settings
RECAPTCHA_PUBLIC_KEY = '6LcEljMUAAAAANxcMEtMPjPTB6IRs1pe5oY5ubSp'
RECAPTCHA_PRIVATE_KEY = os.environ.get('RECAPTCHA_PRIVATE_KEY')

# the lifetime of a permanent session in seconds
PERMANENT_SESSION_LIFETIME = 604800  # 7 days

WEBSOCKET_EXCHANGE = celery_queue('newsroom_notification')

SERVICES = [
    {'name': 'National', 'code': 'n'},
    {'name': 'Courts', 'code': 'c'},
    {'name': 'Entertainment', 'code': 'e'},
    {'name': 'Finance', 'code': 'f'},
    {'name': 'Politics', 'code': 'p'},
    {'name': 'Sport', 'code': 's'},
    {'name': 'World', 'code': 'w'},
    {'name': 'Featured Story', 'code': 'feat'},
]
