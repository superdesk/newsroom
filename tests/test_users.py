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


def test_user_list_fails_for_anonymous_user(client):
    response = client.get('/users')
    assert response.status_code == 403
    assert b'403 Forbidden' in response.data


def test_login_succeeds_for_admin(client):
    response = client.post(
        url_for('auth.login'),
        data={'email': 'admin@sourcefabric.org', 'password': 'admin'},
        follow_redirects=True
    )
    assert response.status_code == 200
    assert b'<h5>There are no items yet.</h5>' in response.data


def test_validation_token_sent_for_user_succeeds(app, client):
    test_login_succeeds_for_admin(client)
    # Insert a new user
    app.data.insert('users', [{
        '_id': ObjectId('59b4c5c61d41c8d736852fbf'),
        'name': 'John Smith',
        'email': 'test@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'public',
        'is_validated': False,
        'is_enabled': True,
        'is_approved': False
    }])
    # Resend the validation token
    response = client.post('/users/59b4c5c61d41c8d736852fbf/validate')
    assert response.status_code == 200
    assert 'A new token has been sent to user' in response.get_data(as_text=True)


def test_validation_token_resend_fails_if_user_is_validated(app, client):
    test_login_succeeds_for_admin(client)
    # Insert a new user
    app.data.insert('users', [{
        '_id': ObjectId('59b4c5c61d41c8d736852fbf'),
        'name': 'John Smith',
        'email': 'test@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'public',
        'is_validated': True,
        'is_enabled': True,
        'is_approved': False
    }])
    # Resend the validation token
    response = client.post('/users/59b4c5c61d41c8d736852fbf/validate')
    assert response.status_code == 400
    assert 'Token is not generated' in response.get_data(as_text=True)


def test_reset_password_token_sent_for_user_succeeds(app, client):
    test_login_succeeds_for_admin(client)
    # Insert a new user
    app.data.insert('users', [{
        '_id': ObjectId('59b4c5c61d41c8d736852fbf'),
        'name': 'John Smith',
        'email': 'test@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'public',
        'is_validated': False,
        'is_enabled': True,
        'is_approved': False
    }])
    # Resend the reset password token
    response = client.post('/users/59b4c5c61d41c8d736852fbf/reset_password')
    assert response.status_code == 200
    assert 'A new token has been sent to user' in response.get_data(as_text=True)
    user = get_resource_service('users').find_one(req=None, email='test@sourcefabric.org')
    assert user.get('token') is not None


def test_reset_password_token_sent_for_user_fails_for_disabled_user(app, client):
    test_login_succeeds_for_admin(client)
    # Insert a new user
    app.data.insert('users', [{
        '_id': ObjectId('59b4c5c61d41c8d736852fbf'),
        'name': 'John Smith',
        'email': 'test@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'public',
        'is_validated': True,
        'is_enabled': False,
        'is_approved': False
    }])
    # Resend the reset password token
    response = client.post('/users/59b4c5c61d41c8d736852fbf/reset_password')
    assert response.status_code == 400
    assert 'Token is not generated' in response.get_data(as_text=True)
    user = get_resource_service('users').find_one(req=None, email='test@sourcefabric.org')
    assert user.get('token') is None
