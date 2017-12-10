from bson import ObjectId
from pytest import fixture
from datetime import datetime, timedelta

from tests.test_users import test_login_succeeds_for_admin, init as users_init


items = [
    {
        '_id': 'tag:foo',
        'type': 'text',
        'version': 2,
        'headline': 'Amazon Is Opening More Bookstores',
        'slugline': 'AMAZON-BOOKSTORE-OPENING',
        'body_html': '<p>New stores will open in DC and Austin in 2018.</p><p>Next line</p>',
        'firstcreated': '2017-11-27T08:00:57+0000',
        'versioncreated': datetime.now(),
        'service': [{'code': 'a', 'name': 'Service A'}],
        'products': [{'id': 1, 'name': 'product-1'}, {'id': 3, 'name': 'product-3'}]
    },
    {
        '_id': 'urn:localhost:weather',
        'type': 'text',
        'version': 1,
        'headline': 'Weather',
        'slugline': 'WEATHER',
        'body_html': '<p>Weather report</p>',
        'ancestors': ['tag:weather', 'tag:weather:old'],
        'firstcreated': datetime.now() - timedelta(days=5),
        'versioncreated': datetime.now().replace(hour=23, minute=55) - timedelta(days=5),
        'service': [{'code': 'b', 'name': 'Service B'}],
        'products': [{'id': 2, 'name': 'product-2'}]
    },
    {
        '_id': 'urn:localhost:flood',
        'type': 'text',
        'version': 1,
        'headline': 'Flood Waters',
        'slugline': 'Disaster',
        'body_html': '<p>Water levels keep rising</p>',
        'firstcreated': datetime.now() - timedelta(days=5),
        'versioncreated': datetime.now().replace(hour=23, minute=55) - timedelta(days=5),
        'service': [{'code': 'c', 'name': 'Service C'}],
        'products': [{'id': 7, 'name': 'product-7'}]
    },
    {
        '_id': 'tag:weather',
        'type': 'text',
        'version': 2,
        'nextversion': 'urn:localhost:weather',
        'versioncreated': datetime.now() - timedelta(days=8),
    },
    {
        '_id': 'tag:weather:old',
        'type': 'text',
        'version': 2,
        'nextversion': 'tag:weather',
        'versioncreated': datetime.now() - timedelta(days=10),
    }
]


@fixture(autouse=True)
def init_items(app):
    app.data.insert('items', items)


@fixture(autouse=True)
def init_auth(app, client):
    users_init(app)
    test_login_succeeds_for_admin(client)


@fixture(autouse=True)
def init_company(app, client):
    app.data.insert('companies', [{
        '_id': 1,
        'name': 'Grain Corp'
    }])

    app.data.insert('users', [{
        '_id': ObjectId('59b4c5c61d41c8d736852fbf'),
        'email': 'foo@bar.com',
        'first_name': 'Foo',
        'last_name': 'Bar',
        'company': 1,
    }])
