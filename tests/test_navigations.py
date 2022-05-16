from bson import ObjectId
from flask import json
from pytest import fixture

from .test_users import test_login_succeeds_for_admin, init as user_init  # noqa
from newsroom.navigations.navigations import get_navigations_by_company


@fixture(autouse=True)
def init(app):
    app.data.insert('navigations', [{
        '_id': ObjectId('59b4c5c61d41c8d736852fbf'),
        'name': 'Sport',
        'product_type': 'wire',
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
    client.post('/navigations/new', data={'navigation': json.dumps({
        'name': 'Breaking',
        'description': 'Breaking news',
        'product_type': 'wire',
        'is_enabled': True,
    })})

    response = client.get('/navigations')
    assert 'Breaking' in response.get_data(as_text=True)


def test_update_navigation(client):
    test_login_succeeds_for_admin(client)

    client.post('/navigations/59b4c5c61d41c8d736852fbf/',
                data={'navigation': json.dumps({
                    'name': 'Sport',
                    'description': 'foo',
                    'product_type': 'wire',
                    'is_enabled': True})})

    response = client.get('/navigations')
    assert 'foo' in response.get_data(as_text=True)


def test_delete_navigation_removes_references(client):
    test_login_succeeds_for_admin(client)

    client.post('/products/new', data=json.dumps({
        'name': 'Breaking',
        'description': 'Breaking news',
        'navigations': '59b4c5c61d41c8d736852fbf',
        'is_enabled': True,
        'product_type': 'wire',
        'query': 'foo'
    }), content_type='application/json')

    client.delete('/navigations/59b4c5c61d41c8d736852fbf')

    response = client.get('/products')
    data = json.loads(response.get_data())
    assert 1 == len(data)
    assert data[0]['name'] == 'Breaking'
    assert data[0]['navigations'] == []


def test_save_navigation_products(client, app):
    app.data.insert('navigations', [{
        '_id': 'n-1',
        'name': 'Navigation 1',
        'is_enabled': True,
        'product_type': 'wire'
    }])

    app.data.insert('products', [{
        '_id': 'p-1',
        'name': 'Sport',
        'description': 'sport product',
        'navigations': ['n-1'],
        'is_enabled': True,
        'product_type': 'wire'
    }, {
        '_id': 'p-2',
        'name': 'News',
        'description': 'news product',
        'is_enabled': True,
        'product_type': 'wire'
    }])

    test_login_succeeds_for_admin(client)
    client.post('navigations/n-1/products', data=json.dumps({'products': ['p-2']}), content_type='application/json')

    response = client.get('/products')
    data = json.loads(response.get_data())
    assert [p for p in data if p['_id'] == 'p-1'][0]['navigations'] == []
    assert [p for p in data if p['_id'] == 'p-2'][0]['navigations'] == ['n-1']


def test_get_agenda_navigations_by_company_returns_ordered(client, app):
    app.data.insert('navigations', [{
        '_id': 'n-1',
        'name': 'Uber',
        'is_enabled': True,
        'product_type': 'agenda',
    }])

    app.data.insert('companies', [{
        '_id': 'c-1',
        'phone': '2132132134',
        'sd_subscriber_id': '12345',
        'name': 'Press Co.',
        'is_enabled': True,
        'contact_name': 'Tom'
    }])

    app.data.insert('products', [{
        '_id': 'p-1',
        'name': 'Top Things',
        'navigations': ['n-1'],
        'companies': ['c-1'],
        'is_enabled': True,
        'query': '_featured',
        'product_type': 'agenda'
    }, {
        '_id': 'p-2',
        'name': 'A News',
        'navigations': ['59b4c5c61d41c8d736852fbf'],
        'companies': ['c-1'],
        'description': 'news product',
        'is_enabled': True,
        'product_type': 'wire',
        'query': 'latest'
    }])

    test_login_succeeds_for_admin(client)
    navigations = get_navigations_by_company('c-1', 'agenda')
    assert navigations[0].get('name') == 'Uber'
    navigations = get_navigations_by_company('c-1', 'wire')
    assert navigations[0].get('name') == 'Sport'


def test_validation_on_new_navigations(client):
    test_login_succeeds_for_admin(client)
    response = client.post('/navigations/new', data={'navigation': json.dumps({
        'name': 'Breaking <script>Bad</script>',
        'description': 'Breaking news',
        'product_type': 'wire',
        'is_enabled': True,
    })})
    assert response.status_code == 400
    assert 'Illegal Character' in response.get_data(as_text=True)
