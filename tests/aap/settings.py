from newsroom.default_settings import BLUEPRINTS, CLIENT_CONFIG

BLUEPRINTS.append('newsroom.am_news')
BLUEPRINTS.append('newsroom.market_place')
BLUEPRINTS.append('newsroom.media_releases')
BLUEPRINTS.append('newsroom.factcheck')

INSTALLED_APPS = [
    'newsroom.am_news',
    'newsroom.market_place',
    'newsroom.media_releases',
    'newsroom.factcheck',
]

CLIENT_TIME_FORMAT = 'HH:mm'
CLIENT_DATE_FORMAT = 'DD/MM/YYYY'
SITE_NAME = 'AAP Newsroom'
COPYRIGHT_HOLDER = 'AAP'
COPYRIGHT_NOTICE = ''
USAGE_TERMS = ''
LANGUAGES = ['en']
DEFAULT_LANGUAGE = 'en'
CLIENT_CONFIG['list_animations'] = False
