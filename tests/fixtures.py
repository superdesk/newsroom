
from pytest import fixture
from datetime import datetime

from tests.test_users import test_login_succeeds_for_admin, init as users_init


items = [
    {
        '_id': 'tag:foo',
        'type': 'text',
        'version': 2,
        'headline': 'Amazon Is Opening More Bookstores',
        'slugline': 'AMAZON-BOOKSTORE-OPENING',
        'body_html': '<p>New stores will open in DC and Austin in 2018.</p><p>Next line</p>',
        'firstcreated': datetime.now(),
        'versioncreated': datetime.now(),
    },
    {
        '_id': 'urn:localhost:weather',
        'type': 'text',
        'version': 1,
        'headline': 'Weather',
        'slugline': 'WEATHER',
        'body_html': '<p>Weather report</p>',
        'ancestors': ['tag:foo'],
        'firstcreated': datetime.now(),
        'versioncreated': datetime.now(),
    },
]


@fixture(autouse=True)
def init(app, client):
    app.data.insert('items', items)
    users_init(app)
    test_login_succeeds_for_admin(client)
