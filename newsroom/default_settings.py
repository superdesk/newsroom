import os

XML = False
IF_MATCH = True
JSON_SORT_KEYS = False
DOMAIN = {}

X_DOMAINS = '*'
X_MAX_AGE = 24 * 3600
X_HEADERS = ['Content-Type', 'Authorization', 'If-Match']

URL_PREFIX = 'api'
SECRET_KEY = os.environ.get('SECRET_KEY', os.urandom(32))

MODULES = [
    'newsroom.news',
    'newsroom.auth',
]
