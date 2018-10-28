import os
import tzlocal

from superdesk.default_settings import (   # noqa
    VERSION,
    MONGO_URI,
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
    'newsroom.section_filters',
    'newsroom.navigations',
    'newsroom.cards',
    'newsroom.reports',
    'newsroom.public',
    'newsroom.agenda',
    'newsroom.settings'
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
    'newsroom.section_filters',
    'newsroom.navigations',
    'newsroom.cards',
    'newsroom.reports',
    'newsroom.public',
    'newsroom.agenda',
    'newsroom.settings'
]

SITE_NAME = 'AAP Newsroom'
COPYRIGHT_HOLDER = 'AAP'
COPYRIGHT_NOTICE = ''
USAGE_TERMS = ''
CONTACT_ADDRESS = 'https://www.aap.com.au/contact/sales-inquiries/'
PRIVACY_POLICY = 'https://www.aap.com.au/legal/'
TERMS_AND_CONDITIONS = 'https://www.aap.com.au/legal/'
SHOW_COPYRIGHT = True

# Email addresses that will receive the coverage request emails (single or comma separated)
COVERAGE_REQUEST_RECIPIENTS = os.environ.get('COVERAGE_REQUEST_RECIPIENTS')

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
FILTER_BY_POST_FILTER = True

# Base64 Encoded Token
AAPPHOTOS_TOKEN = os.environ.get('AAPPHOTOS_TOKEN')

# Base Url for photos: i.e. https://photos.aap.com.au/search/
# If provided it will be used for populating delivery_href
PHOTO_URL = os.environ.get('PHOTO_URL')

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

# Places navigation item(s) for featured story products to the top of the list under All
AGENDA_FEATURED_STORY_NAVIGATION_POSITION_OVERRIDE = True

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
CLIENT_COVERAGE_DATE_FORMAT = 'HH:mm DD/MM'

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
    'live_video': {'name': 'Live Video', 'icon': 'live-video'},
    'live_blog': {'name': 'Live Blog', 'icon': 'live-blog'}
}

LANGUAGES = ['en']
DEFAULT_LANGUAGE = 'en'
