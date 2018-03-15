from flask import json
from pytest import fixture
from bson import ObjectId
from .test_users import test_login_succeeds_for_admin, init as user_init


@fixture(autouse=True)
def init(app):
    user_init(app)
    app.data.insert('companies', [{
        '_id': ObjectId('59bc460f1d41c8fa815cc2c2'),
        'name': 'Press Co.',
        'is_enabled': True,
    }, {
        '_id': ObjectId('59c38b965057fb87d7eda9ab'),
        'name': 'Paper Co.',
        'is_enabled': True,
    }])
    app.data.insert('users', [{
        '_id': 'u-1',
        'email': 'foo@foo.com',
        'first_name': 'Foo',
        'last_name': 'Smith',
        'is_enabled': True,
        'company': ObjectId('59bc460f1d41c8fa815cc2c2'),
    }, {
        '_id': 'u-2',
        'email': 'bar@bar.com',
        'first_name': 'Bar',
        'last_name': 'Brown',
        'is_enabled': True,
    }, {
        '_id': 'u-3',
        'email': 'bar@bar.com',
        'first_name': 'Bar',
        'last_name': 'Brown',
        'is_enabled': True,
        'company': ObjectId('59bc460f1d41c8fa815cc2c2'),
    }])


def test_company_saved_searches(client, app):

    app.data.insert('topics', [{
        'label': 'Foo',
        'query': 'foo',
        'notifications': False,
        'user': 'u-1'
    }, {
        'label': 'Foo',
        'query': 'foo',
        'notifications': False,
        'user': 'u-2'
    }, {
        'label': 'Foo',
        'query': 'foo',
        'notifications': False,
        'user': 'u-3'
    }])

    test_login_succeeds_for_admin(client)
    resp = client.get('reports/company-saved-searches')
    report = json.loads(resp.get_data())
    assert report['name'] == 'Saved searches per company'
    assert len(report['results']) == 1
    assert report['results'][0]['name'] == 'Press Co.'
    assert report['results'][0]['topic_count'] == 2


def test_user_saved_searches(client, app):

    app.data.insert('topics', [{
        'label': 'Foo',
        'query': 'foo',
        'notifications': False,
        'user': 'u-1'
    }, {
        'label': 'Foo',
        'query': 'foo',
        'notifications': False,
        'user': 'u-2'
    }, {
        'label': 'Foo',
        'query': 'foo',
        'notifications': False,
        'user': 'u-1'
    }])

    test_login_succeeds_for_admin(client)
    resp = client.get('reports/user-saved-searches')
    report = json.loads(resp.get_data())
    assert report['name'] == 'Saved searches per user'
    assert len(report['results']) == 1
    assert report['results'][0]['name'] == 'Foo Smith'
    assert report['results'][0]['topic_count'] == 2


def test_company_products(client, app):
    app.data.insert('products', [{
        '_id': 'p-1',
        'name': 'Sport',
        'description': 'sport product',
        'companies': ['59bc460f1d41c8fa815cc2c2'],
        'is_enabled': True,
    }, {
        '_id': 'p-2',
        'name': 'News',
        'description': 'news product',
        'companies': ['59bc460f1d41c8fa815cc2c2', '59c38b965057fb87d7eda9ab'],
        'is_enabled': True,
    }])

    test_login_succeeds_for_admin(client)
    resp = client.get('reports/company-products')
    report = json.loads(resp.get_data())
    assert report['name'] == 'Products per company'
    assert len(report['results']) == 2
    assert report['results'][0]['name'] == 'Paper Co.'
    assert len(report['results'][0]['products']) == 1
    assert report['results'][1]['name'] == 'Press Co.'
    assert len(report['results'][1]['products']) == 2
