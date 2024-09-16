from flask import json, url_for
from bson import ObjectId
from .test_users import test_login_succeeds_for_admin, init as user_init  # noqa
from superdesk import get_resource_service


def test_delete_company_deletes_company_and_users(client):
    test_login_succeeds_for_admin(client)
    # Register a new company
    response = client.post('/companies/new', data=json.dumps({
        'phone': '2132132134',
        'sd_subscriber_id': '12345',
        'name': 'Press Co.',
        'is_enabled': True,
        'contact_name': 'Tom'
    }), content_type='application/json')

    assert response.status_code == 201
    company = get_resource_service('companies').find_one(req=None, name='Press Co.')

    # Register a user for the company
    response = client.post('/users/new', data={
        'email': 'newuser@abc.org',
        'first_name': 'John',
        'last_name': 'Doe',
        'password': 'abc',
        'phone': '1234567',
        'company': ObjectId(company['_id']),
        'user_type': 'public'
    })
    assert response.status_code == 201

    response = client.delete('/companies/{}'.format(str(company['_id'])))
    assert response.status_code == 200

    company = get_resource_service('companies').find_one(req=None, _id=str(company['_id']))
    assert company is None
    user = get_resource_service('users').find_one(req=None, email='newuser@abc.org')
    assert user is None


def test_get_company_users(client):
    test_login_succeeds_for_admin(client)
    resp = client.post('companies/new', data=json.dumps({'name': 'Test'}), content_type='application/json')
    company_id = json.loads(resp.get_data()).get('_id')
    assert company_id
    resp = client.post('users/new', data={
        'company': company_id,
        'first_name': 'foo',
        'last_name': 'bar',
        'phone': '123456789',
        'email': 'foo@bar.com',
        'user_type': 'public',
    })
    assert resp.status_code == 201, resp.get_data().decode('utf-8')
    resp = client.get('companies/%s/users' % company_id)
    assert resp.status_code == 200, resp.get_data().decode('utf-8')
    users = json.loads(resp.get_data())
    assert 1 == len(users)
    assert 'foo' == users[0].get('first_name'), users[0].keys()


def test_save_company_permissions(client, app):
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
        'name': 'Sport',
        'description': 'sport product',
        'companies': ['c-1'],
        'is_enabled': True,
    }, {
        '_id': 'p-2',
        'name': 'News',
        'description': 'news product',
        'is_enabled': True,
    }])

    test_login_succeeds_for_admin(client)
    data = json.dumps({'products': {'p-2': True}, 'sections': {'wire': True}, 'archive_access': True})
    response = client.get('/companies/get-csrf-token')
    data_token = json.loads(response.get_data())
    csrf_token = data_token['csrf_token']
    headers = {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf_token
    }
    response = client.post('companies/c-1/permissions', data=data, headers=headers, content_type='application/json')

    assert response.status_code == 200
    assert json.loads(response.get_data())['message'] == 'Permissions updated successfully'

    response = client.get('/products')
    data = json.loads(response.get_data())
    assert [p for p in data if p['_id'] == 'p-1'][0]['companies'] == []
    assert [p for p in data if p['_id'] == 'p-2'][0]['companies'] == ['c-1']

    updated = app.data.find_one('companies', req=None, _id='c-1')
    assert updated['sections']['wire']
    assert not updated['sections'].get('agenda')
    assert updated['archive_access']

    # available by default
    resp = client.get(url_for('agenda.index'))
    assert resp.status_code == 200

    # set company with wire only
    user = app.data.find_one('users', req=None, first_name='admin')
    assert user
    app.data.update('users', user['_id'], {'company': 'c-1'}, user)

    # test section protection
    resp = client.get(url_for('agenda.index'))
    assert resp.status_code == 403


def test_company_ip_whitelist_validation(client):
    new_company = {
        'name': 'Test',
        'allowed_ip_list': ['wrong']
    }
    test_login_succeeds_for_admin(client)
    resp = client.post('companies/new', data=json.dumps(new_company), content_type='application/json')
    assert resp.status_code == 400
