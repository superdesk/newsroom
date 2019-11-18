from flask_babel import gettext


CLIENT_TIME_FORMAT = 'HH:mm'
CLIENT_DATE_FORMAT = 'MMM DD, YYYY'
SITE_NAME = 'CP Newsroom LJI'
SHOW_USER_REGISTER = True
SHOW_COPYRIGHT = False
COPYRIGHT_HOLDER = 'CP'
COPYRIGHT_NOTICE = ''
USAGE_TERMS = ''
LANGUAGES = ['en', 'fr_CA']
DEFAULT_LANGUAGE = 'en'

PRIVACY_POLICY = PRIVACY_POLICY_EN = 'https://www.thecanadianpress.com/privacy-policy/'
TERMS_AND_CONDITIONS = TERMS_AND_CONDITIONS_EN = \
    'https://www.thecanadianpress.com/content-services/custom-content-creation/terms-conditions/'
CONTACT_ADDRESS = 'https://www.thecanadianpress.com/contact/'
CONTACT_ADDRESS_EN = 'https://www.thecanadianpress.com/contact/'

WIRE_AGGS = {
    'service': {'terms': {'field': 'service.name', 'size': 50}},
    'subject': {'terms': {'field': 'subject.name', 'size': 20}},
}

WIRE_GROUPS = [
    {
        'field': 'service',
        'label': gettext('Category'),
    },
    {
        'field': 'subject',
        'label': gettext('Subject'),
    }
]
