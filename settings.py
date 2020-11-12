from newsroom.default_settings import CELERY_BEAT_SCHEDULE as CELERY_BEAT_SCHEDULE_DEFAULT
from newsroom.default_settings import (
    CLIENT_CONFIG
)


SITE_NAME = 'Mediapankki'
COPYRIGHT_HOLDER = 'STT'

PRIVACY_POLICY = PRIVACY_POLICY_EN = 'https://stt.fi/tietosuoja/'
TERMS_AND_CONDITIONS = TERMS_AND_CONDITIONS_EN = 'https://stt.fi/kayttoehdot/'
CONTACT_ADDRESS = 'https://stt.fi/yhteystiedot/'
CONTACT_ADDRESS_EN = 'https://stt.fi/en/contact/'

INSTALLED_APPS = [
    'stt.external_links',
    'stt.filters',
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
    'newsroom.monitoring',
]

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
    'newsroom.settings',
    'newsroom.monitoring',
    'newsroom.history',
]

LANGUAGES = ['fi', 'en']
DEFAULT_LANGUAGE = 'fi'

COMPANY_TYPES = [
    dict(
        id='premium',
        name='Premium',
        # no filter, gets all
    ),
    dict(
        id='non-premium',
        name='Non-premium',
        wire_must_not={'bool': {'must': [  # filter out
            {'term': {'sttdone1': '5'}},  # premium
            {'range': {'embargoed': {'gte': 'now'}}},  # with embargo
        ]}},
    ),
    dict(
        id='non-media',
        name='Non-media',
        wire_must_not={'range': {'embargoed': {'gte': 'now'}}},  # filter out embargo
    ),
]

WATERMARK_IMAGE = None

CELERY_BEAT_SCHEDULE = {key: val for key, val in CELERY_BEAT_SCHEDULE_DEFAULT.items()
                        if key == 'newsroom.company_expiry'}

ENABLE_WATCH_LISTS = False

NEWS_API_ENABLED = False

CLIENT_CONFIG['display_word_count'] = False
CLIENT_CONFIG['display_char_count'] = True
