from flask import url_for, json
from pytest import fixture
from bson import ObjectId
from superdesk import get_resource_service
from .test_users import test_login_succeeds_for_admin, init as user_init


@fixture(autouse=True)
def init(app):
    user_init(app)
    app.data.insert('products', [{
        '_id': ObjectId('59b4c5c61d41c8d736852fbf'),
        'name': 'Sport',
        'description': 'Top level sport product',
        'product_type': 'top_level',
        'is_enabled': True,

    }])


def test_product_list_fails_for_anonymous_user(client):
    response = client.get('/products/search')
    assert response.status_code == 403
    assert b'403 Forbidden' in response.data


def test_return_search_for_products(client):
    test_login_succeeds_for_admin(client)
    # Register a new account
    client.post('/products/new', data=json.dumps({
        'name': 'Breaking',
        'description': 'Breaking news',
        'is_enabled': True,
        'product_type': 'top_level',
    }), content_type='application/json')

    response = client.get('/products/search?q=br')
    assert 'Breaking' in response.get_data(as_text=True)


def test_update_products(client):
    test_login_succeeds_for_admin(client)
    # Register a new account

    client.post('/products/59b4c5c61d41c8d736852fbf/',
                data=json.dumps({'name': 'Sport',
                      'description': 'foo',
                      'product_type': 'top_level',
                      'is_enabled': True,'description': 'foo'}), content_type='application/json')

    response = client.get('/products')
    assert 'foo' in response.get_data(as_text=True)


def test_create_and_delete_sub_product(client):
    test_login_succeeds_for_admin(client)
    # Register a new account

    client.post('/products/new', data=json.dumps({
        'name': 'Breaking',
        'description': 'Breaking news',
        'parents': '59b4c5c61d41c8d736852fbf',
        'is_enabled': True,
        'product_type': 'query',
    }), content_type='application/json')

    response = client.delete('/products/59b4c5c61d41c8d736852fbf')

    response = client.get('/products')
    data = json.loads(response.get_data())
    assert 1 == len(data)
    assert data[0]['name'] == 'Breaking'
    assert data[0]['parents'] == []

