from flask import url_for
from pytest import fixture
from bson import ObjectId
from superdesk import get_resource_service


@fixture(autouse=True)
def init(app):
    app.data.insert('users', [{
        '_id': 1,
        'name': 'admin',
        'email': 'admin@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'administrator',
        'is_validated': True,
        'is_enabled': True,
        'is_approved': True
    }])


def test_company_list_fails_for_anonymous_user(client):
    response = client.get('/companies')
    assert response.status_code == 403
    assert b'403 Forbidden' in response.data


def test_login_succeeds_for_admin(client):
    response = client.post(
        url_for('auth.login'),
        data={'email': 'admin@sourcefabric.org', 'password': 'admin'},
        follow_redirects=True
    )
    assert response.status_code == 200


def test_delete_company_deletes_company_and_users(client):
    test_login_succeeds_for_admin(client)
    # Register a new company
    response = client.post('/companies/new', data={
        'phone': '2132132134',
        'sd_subscriber_id': '12345',
        'name': 'Press Co.',
        'is_enabled': True,
        'contact_name': 'Tom'
    })

    assert response.status_code == 201
    company = get_resource_service('companies').find_one(req=None, name='Press Co.')

    # Register a user for the company
    response = client.post('/users/new', data={
        'email': 'newuser@abc.org',
        'name': 'John Doe',
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
