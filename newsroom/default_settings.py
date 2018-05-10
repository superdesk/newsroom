import os
import tzlocal

from superdesk.default_settings import (   # noqa
    VERSION,
    CONTENTAPI_MONGO_URI,
    CONTENTAPI_ELASTICSEARCH_URL,
    CONTENTAPI_ELASTICSEARCH_INDEX,
    ELASTICSEARCH_URL,
    ELASTICSEARCH_SETTINGS,
    ELASTIC_DATE_FORMAT,
    CELERY_BROKER_URL,
    celery_queue,
    AMAZON_SECRET_ACCESS_KEY,
    AMAZON_ACCESS_KEY_ID,
    AMAZON_CONTAINER_NAME,
    AMAZON_OBJECT_ACL,
    AMAZON_S3_SUBFOLDER,
    AMAZON_REGION
)

XML = False
IF_MATCH = True
JSON_SORT_KEYS = False
DOMAIN = {}

X_DOMAINS = '*'
X_MAX_AGE = 24 * 3600
X_HEADERS = ['Content-Type', 'Accept', 'If-Match', 'Access-Control-Allow-Origin', 'Authorization']
X_EXPOSE_HEADERS = ['Access-Control-Allow-Origin']
X_ALLOW_CREDENTIALS = True

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
    'newsroom.notifications',
    'newsroom.products',
    'newsroom.navigations',
    'newsroom.cards',
    'newsroom.reports',
    'newsroom.public',
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
    'newsroom.history',
    'newsroom.notifications',
    'newsroom.products',
    'newsroom.navigations',
    'newsroom.cards',
    'newsroom.reports',
    'newsroom.public',
]

SITE_NAME = 'AAP Newsroom'
COPYRIGHT_HOLDER = 'AAP'
COPYRIGHT_NOTICE = ''
USAGE_TERMS = ''
CONTACT_ADDRESS = 'https://www.aap.com.au/contact/sales-inquiries/'
PRIVACY_POLICY = 'https://www.aap.com.au/legal/'
TERMS_AND_CONDITIONS = 'https://www.aap.com.au/legal/'


TEMPLATES_AUTO_RELOAD = True

DEFAULT_TIMEZONE = os.environ.get('DEFAULT_TIMEZONE')
DATE_FORMAT = '%Y-%m-%dT%H:%M:%S+0000'

if DEFAULT_TIMEZONE is None:
    DEFAULT_TIMEZONE = tzlocal.get_localzone().zone

BABEL_DEFAULT_TIMEZONE = DEFAULT_TIMEZONE

WEBPACK_MANIFEST_PATH = os.path.join(os.path.dirname(__file__), 'static', 'dist', 'manifest.json')
WEBPACK_ASSETS_URL = os.environ.get('ASSETS_URL', '/static/dist/')
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
CACHE_TYPE = os.environ.get('CACHE_TYPE', 'simple')  # in-memory cache
# The default timeout that is used if no timeout is specified in sec
CACHE_DEFAULT_TIMEOUT = 3600
# Redis host (used only if CACHE_TYPE is redis)
CACHE_REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')

# Recaptcha Settings
RECAPTCHA_PUBLIC_KEY = os.environ.get('RECAPTCHA_PUBLIC_KEY')
RECAPTCHA_PRIVATE_KEY = os.environ.get('RECAPTCHA_PRIVATE_KEY')

# Filter tab behaviour
# If true, aggregations will be against all content all the time
# If false, aggregations will change by filters applied
FILTER_BY_POST_FILTER = False

# Base64 Encoded Token
AAPPHOTOS_TOKEN = os.environ.get('AAPPHOTOS_TOKEN')

# Home Page Carousel Sources
HOMEPAGE_CAROUSEL = [{
    'source': 'https://photos-api.aap.com.au/api/v3/Galleries/Newsroom/AUSTRALIAN%20NEWS',
    'count': 2
}, {
    'source': 'https://photos-api.aap.com.au/api/v3/Galleries/Newsroom/AUSTRALIAN%20SPORT',
    'count': 2
}]

# List of filters to remove matching stories when news only switch is turned on
NEWS_ONLY_FILTERS = [
    {'match': {'genre.code': 'Results (sport)'}},
    {'match': {'source': 'PMF'}},
]

# the lifetime of a permanent session in seconds
PERMANENT_SESSION_LIFETIME = 604800  # 7 days

# the time to live value in days for user notifications
NOTIFICATIONS_TTL = 1

WEBSOCKET_EXCHANGE = celery_queue('newsroom_notification')

SERVICES = [
    {"name": "Domestic Sport", "code": "t"},
    {"name": "Overseas Sport", "code": "s"},
    {"name": "Finance", "code": "f"},
    {"name": "International News", "code": "i"},
    {"name": "Entertainment", "code": "e"},

    # {"name": "Australian General News", "code": "a"},
    # {"name": "Australian Weather", "code": "b"},
    # {"name": "General Features", "code": "c"},
    # {"name": "FormGuide", "code": "h"},
    # {"name": "Press Release Service", "code": "j"},
    # {"name": "Lotteries", "code": "l"},
    # {"name": "Line Check Messages", "code": "m"},
    # {"name": "State Parliaments", "code": "o"},
    # {"name": "Federal Parliament", "code": "p"},
    # {"name": "Stockset", "code": "q"},
    # {"name": "Racing (Turf)", "code": "r"},
    # {"name": "Advisories", "code": "v"},
    # {"name": "Special Events (olympics/ Aus elections)", "code": "x"},
]

CLIENT_TIME_FORMAT = 'HH:mm'
CLIENT_DATE_FORMAT = 'DD/MM/YYYY'

WATERMARK_IMAGE = os.path.join(os.path.dirname(__file__), 'static', 'watermark.png')
