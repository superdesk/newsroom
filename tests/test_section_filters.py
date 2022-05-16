from bson import ObjectId
from flask import json
from pytest import fixture

from .test_users import test_login_succeeds_for_admin, init as user_init  # noqa


@fixture(autouse=True)
def init(app):
    app.data.insert('section_filters', [{
        '_id': ObjectId('59b4c5c61d41c8d736852fbf'),
        'name': 'Sport',
        'description': 'Sports Filter',
        'is_enabled': True,
    }])


def test_filter_list_fails_for_anonymous_user(client):
    response = client.get('/section_filters/search')
    assert response.status_code == 403
    assert b'Forbidden' in response.data


def test_return_search_for_filters(client):
    test_login_succeeds_for_admin(client)
    client.post('/section_filters/new', data=json.dumps({
        'name': 'Breaking',
        'description': 'Breaking news',
        'is_enabled': True,
        'sd_product_id': '123',
    }), content_type='application/json')

    response = client.get('/section_filters/search?q=br')
    assert 'Breaking' in response.get_data(as_text=True)


def test_create_fails_in_validation(client):
    test_login_succeeds_for_admin(client)
    response = client.post('/section_filters/new', data=json.dumps({
        'description': 'Breaking news',
        'is_enabled': True,
    }), content_type='application/json')

    assert response.status_code == 400
    assert 'name' in response.get_data(as_text=True)


def test_update_fails_in_validation(client):
    test_login_succeeds_for_admin(client)
    response = client.post('/section_filters/59b4c5c61d41c8d736852fbf', data=json.dumps({
        'name': 'Sport',
        'description': 'Breaking <script>bad</script> news',
        'is_enabled': True,
    }), content_type='application/json')

    assert response.status_code == 400
    assert 'Illegal Character' in response.get_data(as_text=True)


def test_update_filters(client):
    test_login_succeeds_for_admin(client)

    resp = client.post('/section_filters/59b4c5c61d41c8d736852fbf',
                       data=json.dumps({'name': 'Sport',
                                        'description': 'foo',
                                        'is_enabled': True,
                                        'sd_product_id': '123'}),
                       content_type='application/json')

    assert 200 == resp.status_code

    response = client.get('/section_filters')
    assert 'foo' in response.get_data(as_text=True)


def test_delete_product(client):
    test_login_succeeds_for_admin(client)

    client.post('/section_filters/new', data=json.dumps({
        'name': 'Breaking',
        'description': 'Breaking news',
        'parents': '59b4c5c61d41c8d736852fbf',
        'is_enabled': True,
        'query': 'bar'
    }), content_type='application/json')

    resp = client.delete('/section_filters/59b4c5c61d41c8d736852fbf')
    assert 200 == resp.status_code

    response = client.get('/section_filters')
    data = json.loads(response.get_data())
    assert 1 == len(data)
    assert data[0]['name'] == 'Breaking'


def test_gets_all_products(client, app):
    test_login_succeeds_for_admin(client)

    for i in range(250):
        app.data.insert('section_filters', [{
            'name': 'Sport-%s' % i,
            'description': 'Top level sport product',
            'is_enabled': True,
        }])

    resp = client.get('/section_filters')
    data = json.loads(resp.get_data())
    assert 251 == len(data)
