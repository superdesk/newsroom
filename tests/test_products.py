from bson import ObjectId
from flask import json
from pytest import fixture

from .test_users import test_login_succeeds_for_admin, init as user_init  # noqa


@fixture(autouse=True)
def init(app):
    app.data.insert('products', [{
        '_id': ObjectId('59b4c5c61d41c8d736852fbf'),
        'name': 'Sport',
        'description': 'Top level sport product',
        'is_enabled': True,
    }])


def test_product_list_fails_for_anonymous_user(client):
    response = client.get('/products/search')
    assert response.status_code == 403
    assert b'Forbidden' in response.data


def test_return_search_for_products(client):
    test_login_succeeds_for_admin(client)
    client.post('/products/new', data=json.dumps({
        'name': 'Breaking',
        'description': 'Breaking news',
        'is_enabled': True,
        'sd_product_id': '123',
    }), content_type='application/json')

    response = client.get('/products/search?q=br')
    assert 'Breaking' in response.get_data(as_text=True)


def test_create_fails_in_validation(client):
    test_login_succeeds_for_admin(client)
    response = client.post('/products/new', data=json.dumps({
        'description': 'Breaking news',
        'is_enabled': True,
    }), content_type='application/json')

    assert response.status_code == 400
    assert 'name' in response.get_data(as_text=True)


def test_update_fails_in_validation(client):
    test_login_succeeds_for_admin(client)
    response = client.post('/products/59b4c5c61d41c8d736852fbf', data=json.dumps({
        'description': 'Breaking <script>bad</script> news',
        'is_enabled': True,
        'name': 'test'
    }), content_type='application/json')

    assert response.status_code == 400
    assert 'Illegal Character' in response.get_data(as_text=True)


def test_clean_product_returned(client, app):
    app.data.insert('products', [{
        '_id': ObjectId('123456789012345678901234'),
        'name': 'Sport <script>Stored</script>',
        'description': 'Top level sport product',
        'is_enabled': True,
    }])
    test_login_succeeds_for_admin(client)
    response = client.get('/products')
    assert response.status_code == 200
    products = json.loads(response.get_data())
    assert 'script' not in products[0].get('name')


def test_update_products(client):
    test_login_succeeds_for_admin(client)

    resp = client.post('/products/59b4c5c61d41c8d736852fbf',
                       data=json.dumps({'name': 'Sport',
                                        'description': 'foo',
                                        'is_enabled': True,
                                        'sd_product_id': '123'}),
                       content_type='application/json')

    assert 200 == resp.status_code

    response = client.get('/products')
    assert 'foo' in response.get_data(as_text=True)


def test_delete_product(client):
    test_login_succeeds_for_admin(client)

    client.post('/products/new', data=json.dumps({
        'name': 'Breaking',
        'description': 'Breaking news',
        'parents': '59b4c5c61d41c8d736852fbf',
        'is_enabled': True,
        'query': 'bar'
    }), content_type='application/json')

    resp = client.delete('/products/59b4c5c61d41c8d736852fbf')
    assert 200 == resp.status_code

    response = client.get('/products')
    data = json.loads(response.get_data())
    assert 1 == len(data)
    assert data[0]['name'] == 'Breaking'


def test_gets_all_products(client, app):
    test_login_succeeds_for_admin(client)

    for i in range(250):
        app.data.insert('products', [{
            'name': 'Sport-%s' % i,
            'description': 'Top level sport product',
            'is_enabled': True,
        }])

    resp = client.get('/products')
    data = json.loads(resp.get_data())
    assert 251 == len(data)
