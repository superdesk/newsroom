import os
import tzlocal

from kombu import Queue, Exchange
from celery.schedules import crontab
from superdesk.default_settings import strtobool, env, local_to_utc_hour
from datetime import timedelta
from newsroom import company_expiry_alerts  # noqa
from newsroom.monitoring import email_alerts  # noqa

from superdesk.default_settings import (   # noqa
    VERSION,
    MONGO_URI,
    REDIS_URL,
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
    AMAZON_REGION,
    MAIL_SERVER,
    MAIL_PORT,
    MAIL_USE_TLS,
    MAIL_USE_SSL,
    _MAIL_FROM,
    MAIL_USERNAME,
    MAIL_PASSWORD,
    CELERY_TASK_ALWAYS_EAGER,
    CELERY_TASK_SERIALIZER,
    CELERY_TASK_PROTOCOL,
    CELERY_TASK_IGNORE_RESULT,
    CELERY_TASK_SEND_EVENTS,
    CELERY_WORKER_DISABLE_RATE_LIMITS,
    CELERY_WORKER_TASK_SOFT_TIME_LIMIT,
    CELERY_WORKER_LOG_FORMAT,
    CELERY_WORKER_TASK_LOG_FORMAT,
    CELERY_WORKER_CONCURRENCY,
    CELERY_BEAT_SCHEDULE_FILENAME,
    LOG_CONFIG_FILE,
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

# keys for signing, should be binary
SECRET_KEY = os.environ.get('SECRET_KEY', '').encode() or os.urandom(32)
PUSH_KEY = os.environ.get('PUSH_KEY', '').encode()

#: Default TimeZone, will try to guess from server settings if not set
DEFAULT_TIMEZONE = os.environ.get('DEFAULT_TIMEZONE')

if DEFAULT_TIMEZONE is None:
    DEFAULT_TIMEZONE = tzlocal.get_localzone().zone

if not DEFAULT_TIMEZONE:
    raise ValueError("DEFAULT_TIMEZONE is empty")

BABEL_DEFAULT_TIMEZONE = DEFAULT_TIMEZONE

BLUEPRINTS = [
    'newsroom.wire',
    'newsroom.auth',
    'newsroom.users',
    'newsroom.companies',
    'newsroom.design',
    'newsroom.history',
    'newsroom.push',
    'newsroom.topics',
    'newsroom.upload',
    'newsroom.notifications',
    'newsroom.products',
    'newsroom.section_filters',
    'newsroom.navigations',
    'newsroom.cards',
    'newsroom.reports',
    'newsroom.public',
    'newsroom.agenda',
    'newsroom.settings',
    'newsroom.news_api.api_tokens',
    'newsroom.monitoring',
]

CORE_APPS = [
    'superdesk.notification',
    'superdesk.data_updates',
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
    'newsroom.ui_config',
    'newsroom.notifications',
    'newsroom.products',
    'newsroom.section_filters',
    'newsroom.navigations',
    'newsroom.cards',
    'newsroom.reports',
    'newsroom.public',
    'newsroom.agenda',
    'newsroom.settings',
    'newsroom.photos',
    'newsroom.media_utils',
    'newsroom.news_api',
    'newsroom.news_api.api_tokens',
    'newsroom.monitoring',
    'newsroom.company_expiry_alerts',
]

SITE_NAME = 'AAP Newsroom'
COPYRIGHT_HOLDER = 'AAP'
COPYRIGHT_NOTICE = ''
USAGE_TERMS = ''
CONTACT_ADDRESS = 'https://www.aap.com.au/contact/sales-inquiries/'
PRIVACY_POLICY = 'https://www.aap.com.au/legal/'
TERMS_AND_CONDITIONS = 'https://www.aap.com.au/legal/'
SHOW_COPYRIGHT = True
SHOW_USER_REGISTER = False

TEMPLATES_AUTO_RELOAD = True

DATE_FORMAT = '%Y-%m-%dT%H:%M:%S+0000'

WEBPACK_MANIFEST_PATH = os.path.join(os.path.dirname(__file__), 'static', 'dist', 'manifest.json')
WEBPACK_ASSETS_URL = os.environ.get('ASSETS_URL', '/static/dist/')
WEBPACK_SERVER_URL = os.environ.get('WEBPACK_SERVER_URL', 'http://localhost:8080/')

# How many days a new account can stay active before it is approved by admin
NEW_ACCOUNT_ACTIVE_DAYS = 14

# Enable CSRF protection for forms
WTF_CSRF_ENABLED = True

#: The number of days a token is valid
RESET_PASSWORD_TOKEN_TIME_TO_LIVE = 1
#: The number of days a validation token is valid
VALIDATE_ACCOUNT_TOKEN_TIME_TO_LIVE = 1
#: The number login attempts allowed before account is locked
MAXIMUM_FAILED_LOGIN_ATTEMPTS = 5
#: default sender for superdesk emails
MAIL_DEFAULT_SENDER = _MAIL_FROM or 'newsroom@localhost'
# Recipients for the sign up form filled by new users (single or comma separated)
SIGNUP_EMAIL_RECIPIENTS = os.environ.get('SIGNUP_EMAIL_RECIPIENTS')

#: public client url - used to create links within emails etc
CLIENT_URL = 'http://localhost:5050'

MEDIA_PREFIX = os.environ.get('MEDIA_PREFIX', '/assets')

# Flask Limiter Settings
RATELIMIT_ENABLED = True
RATELIMIT_STRATEGY = 'fixed-window'

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

FILTER_AGGREGATIONS = True

# List of filters to remove matching stories when news only switch is turned on
NEWS_ONLY_FILTERS = [
   {'match': {'genre.code': 'Results (sport)'}},
   {'match': {'source': 'PMF'}},
]

# the lifetime of a permanent session in seconds
PERMANENT_SESSION_LIFETIME = 604800  # 7 days

# the time to live value in days for user notifications
NOTIFICATIONS_TTL = 1

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
CLIENT_COVERAGE_DATE_TIME_FORMAT = 'HH:mm DD/MM'
CLIENT_COVERAGE_DATE_FORMAT = 'DD/MM'


# Hides or displays abstract on preview panel and details modal
DISPLAY_ABSTRACT = False


WATERMARK_IMAGE = os.path.join(os.path.dirname(__file__), 'static', 'watermark.png')

GOOGLE_MAPS_KEY = os.environ.get('GOOGLE_MAPS_KEY')
GOOGLE_ANALYTICS = os.environ.get('GOOGLE_ANALYTICS')

COVERAGE_TYPES = {
    'text': {'name': 'Text', 'icon': 'text'},
    'photo': {'name': 'Photo', 'icon': 'photo'},
    'picture': {'name': 'Picture', 'icon': 'photo'},
    'audio': {'name': 'Audio', 'icon': 'audio'},
    'video': {'name': 'Video', 'icon': 'video'},
    'explainer': {'name': 'Explainer', 'icon': 'explainer'},
    'infographics': {'name': 'Infographics', 'icon': 'infographics'},
    'graphic': {'name': 'Graphic', 'icon': 'infographics'},
    'live_video': {'name': 'Live Video', 'icon': 'live-video'},
    'live_blog': {'name': 'Live Blog', 'icon': 'live-blog'},
    'video_explainer': {'name': 'Video Explainer', 'icon': 'explainer'}
}


# Client configuration
CLIENT_CONFIG = {
    'time_format': CLIENT_TIME_FORMAT,
    'date_format': CLIENT_DATE_FORMAT,
    'coverage_date_time_format': CLIENT_COVERAGE_DATE_TIME_FORMAT,
    'coverage_date_format': CLIENT_COVERAGE_DATE_FORMAT,
    'coverage_types': COVERAGE_TYPES,
    'display_abstract': DISPLAY_ABSTRACT,
    'list_animations': True,  # Enables or disables the animations for list item select boxes,
    'display_news_only': True  # Displays news only switch in wire
}

LANGUAGES = ['en', 'fi', 'cs', 'fr_CA']
DEFAULT_LANGUAGE = 'en'

# Enable iframely support for item body_html
IFRAMELY = True

COMPANY_TYPES = []

#: celery config
WEBSOCKET_EXCHANGE = celery_queue('newsroom_notification')

CELERY_TASK_DEFAULT_QUEUE = celery_queue('newsroom')
CELERY_TASK_QUEUES = (
    Queue(celery_queue('newsroom'), Exchange(celery_queue('newsroom'), type='topic'), routing_key='newsroom.#'),
)

CELERY_TASK_ROUTES = {
    'newsroom.*': {
        'queue': celery_queue('newsroom'),
        'routing_key': 'newsroom.task',
    }
}

#: celery beat config
CELERY_BEAT_SCHEDULE = {
    'newsroom:company_expiry': {
        'task': 'newsroom.company_expiry_alerts.company_expiry',
        'schedule': crontab(hour=local_to_utc_hour(0), minute=0),  # Runs every day at midnight
    },
    'newsroom:monitoring_schedule_alerts': {
        'task': 'newsroom.monitoring.email_alerts.monitoring_schedule_alerts',
        'schedule': timedelta(seconds=60),
    },
    'newsroom:monitoring_immediate_alerts': {
        'task': 'newsroom.monitoring.email_alerts.monitoring_immediate_alerts',
        'schedule': timedelta(seconds=60),
    }
}

MAX_EXPIRY_QUERY_LIMIT = os.environ.get('MAX_EXPIRY_QUERY_LIMIT', 100)
CONTENT_API_EXPIRY_DAYS = os.environ.get('CONTENT_API_EXPIRY_DAYS', 180)

NEWS_API_ENABLED = strtobool(env('NEWS_API_ENABLED', 'false'))
