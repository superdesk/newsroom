from bson import ObjectId
from flask import json
from pytest import fixture

from .test_users import test_login_succeeds_for_admin, init as user_init


@fixture(autouse=True)
def init(app):
    user_init(app)
    app.data.insert('navigations', [{
        '_id': ObjectId('59b4c5c61d41c8d736852fbf'),
        'name': 'Sport',
        'description': 'Top level sport navigation',
        'is_enabled': True,
    }])


def test_navigation_list_succeeds_for_anonymous_user(client):
    response = client.get('/navigations')
    assert response.status_code == 200
    assert b'Sport' in response.data


def test_save_and_return_navigations(client):
    test_login_succeeds_for_admin(client)
    # Save a new navigation
    client.post('/navigations/new', data=json.dumps({
        'name': 'Breaking',
        'description': 'Breaking news',
        'is_enabled': True,
    }), content_type='application/json')

    response = client.get('/navigations')
    assert 'Breaking' in response.get_data(as_text=True)


def test_update_navigation(client):
    test_login_succeeds_for_admin(client)

    client.post('/navigations/59b4c5c61d41c8d736852fbf/',
                data=json.dumps({'name': 'Sport',
                                 'description': 'foo',
                                 'is_enabled': True}),
                content_type='application/json')

    response = client.get('/navigations')
    assert 'foo' in response.get_data(as_text=True)


def test_delete_navigation_removes_references(client):
    test_login_succeeds_for_admin(client)

    client.post('/products/new', data=json.dumps({
        'name': 'Breaking',
        'description': 'Breaking news',
        'navigations': '59b4c5c61d41c8d736852fbf',
        'is_enabled': True,
        'product_type': 'query',
        'query': 'foo',
    }), content_type='application/json')

    client.delete('/navigations/59b4c5c61d41c8d736852fbf')

    response = client.get('/products')
    data = json.loads(response.get_data())
    assert 1 == len(data)
    assert data[0]['name'] == 'Breaking'
    assert data[0]['navigations'] == []
