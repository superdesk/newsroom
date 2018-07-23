from flask import url_for
from pytest import fixture
from bson import ObjectId
from flask import json

from superdesk import get_resource_service


@fixture(autouse=True)
def init(app):
    app.data.insert('users', [{
        '_id': ObjectId(),
        'first_name': 'admin',
        'last_name': 'admin',
        'email': 'admin@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'administrator',
        'is_validated': True,
        'is_enabled': True,
        'is_approved': True
    }])


def test_user_list_fails_for_anonymous_user(client):
    response = client.get('/users/search')
    assert response.status_code == 403
    assert b'403 Forbidden' in response.data


def test_return_search_for_users(client):
    test_login_succeeds_for_admin(client)
    # Register a new account
    response = client.post('/users/new', data={
        'email': 'newuser@abc.org',
        'first_name': 'John',
        'last_name': 'Doe',
        'password': 'abc',
        'phone': '1234567',
        'company': ObjectId('59b4c5c61d41c8d736852fbf'),
        'user_type': 'public'
    })

    response = client.get('/users/search?q=jo')
    assert 'John' in response.get_data(as_text=True)


def test_login_succeeds_for_admin(client):
    response = client.post(
        url_for('auth.login'),
        data={'email': 'admin@sourcefabric.org', 'password': 'admin'},
        follow_redirects=True
    )
    assert response.status_code == 200


def test_reset_password_token_sent_for_user_succeeds(app, client):
    test_login_succeeds_for_admin(client)
    # Insert a new user
    app.data.insert('users', [{
        '_id': ObjectId('59b4c5c61d41c8d736852fbf'),
        'first_name': 'John',
        'last_name': 'Smith',
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
    assert '"success": true' in response.get_data(as_text=True)
    user = get_resource_service('users').find_one(req=None, email='test@sourcefabric.org')
    assert user.get('token') is not None


def test_reset_password_token_sent_for_user_fails_for_disabled_user(app, client):
    test_login_succeeds_for_admin(client)
    # Insert a new user
    app.data.insert('users', [{
        '_id': ObjectId('59b4c5c61d41c8d736852fbf'),
        'first_name': 'John',
        'last_name': 'Smith',
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
    assert '"message": "Token could not be sent"' in response.get_data(as_text=True)
    user = get_resource_service('users').find_one(req=None, email='test@sourcefabric.org')
    assert user.get('token') is None


def test_new_user_has_correct_flags(client):
    test_login_succeeds_for_admin(client)
    # Register a new account
    response = client.post('/users/new', data={
        'email': 'newuser@abc.org',
        'first_name': 'John',
        'last_name': 'Doe',
        'password': 'abc',
        'phone': '1234567',
        'company': '',
        'user_type': 'public'
    })

    # print(response.get_data(as_text=True))

    assert response.status_code == 201
    user = get_resource_service('users').find_one(req=None, email='newuser@abc.org')
    assert not user['is_approved']
    assert not user['is_enabled']


def test_new_user_fails_if_email_is_used_before(client):
    test_login_succeeds_for_admin(client)
    # Register a new account
    response = client.post('/users/new', data={
        'email': 'newuser@abc.org',
        'first_name': 'John',
        'last_name': 'Doe',
        'password': 'abc',
        'phone': '1234567',
        'company': '',
        'user_type': 'public'
    })

    response = client.post('/users/new', data={
        'email': 'newuser@abc.org',
        'first_name': 'John',
        'last_name': 'Smith',
        'password': 'abc',
        'phone': '1234567',
        'company': '',
        'user_type': 'public'
    })

    # print(response.get_data(as_text=True))

    assert response.status_code == 400
    assert 'Email address is already in use' in response.get_data(as_text=True)


def test_create_new_user_succeeds(app, client):
    test_login_succeeds_for_admin(client)
    company_ids = app.data.insert('companies', [{
        'phone': '2132132134',
        'sd_subscriber_id': '12345',
        'name': 'Press Co.',
        'is_enabled': True,
        'contact_name': 'Tom'
    }])
    with app.mail.record_messages() as outbox:
        # Insert a new user
        response = client.post('/users/new', data={
            'email': 'newuser@abc.org',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'abc',
            'country': 'Australia',
            'phone': '1234567',
            'company': company_ids[0],
            'user_type': 'public',
            'is_enabled': True
        })
        assert response.status_code == 201
        assert len(outbox) == 1
        assert outbox[0].recipients == ['newuser@abc.org']
        assert 'account created' in outbox[0].subject

    # get reset password token
    user = list(app.data.find('users', req=None, lookup={'email': 'newuser@abc.org'}))[0]
    client.get(url_for('auth.reset_password', token=user['token']))

    # change the password
    response = client.post(url_for('auth.reset_password', token=user['token']), data={
        'new_password': 'abc123def',
        'new_password2': 'abc123def',
    })
    assert response.status_code == 302

    # Login with the new account succeeds
    response = client.post(
        url_for('auth.login'),
        data={'email': 'newuser@abc.org', 'password': 'abc123def'},
        follow_redirects=True
    )
    assert response.status_code == 200
    assert 'John' in response.get_data(as_text=True)

    # Logout
    response = client.get(url_for('auth.logout'), follow_redirects=True)
    txt = response.get_data(as_text=True)
    assert 'John' not in txt
    assert 'Login' in txt


def test_new_user_fails_if_fields_not_provided(client):
    test_login_succeeds_for_admin(client)
    # Register a new account
    response = client.post(url_for('users.create'), data={
        'phone': '1234567',
    })
    txt = response.get_data(as_text=True)

    # print(txt)

    assert '"first_name"' in txt
    assert '"last_name"' in txt
    assert '"email"' in txt
    assert 'user_type' in txt


def test_new_user_can_be_deleted(client):
    test_login_succeeds_for_admin(client)
    # Register a new account
    response = client.post('/users/new', data={
        'email': 'newuser@abc.org',
        'first_name': 'John',
        'last_name': 'Doe',
        'password': 'abc',
        'phone': '1234567',
        'company': '',
        'user_type': 'public'
    })

    # print(response.get_data(as_text=True))

    assert response.status_code == 201
    user = get_resource_service('users').find_one(req=None, email='newuser@abc.org')

    response = client.delete('/users/{}'.format(user['_id']))
    assert response.status_code == 200

    user = get_resource_service('users').find_one(req=None, email='newuser@abc.org')
    assert user is None


def test_return_search_for_all_users(client, app):
    test_login_succeeds_for_admin(client)

    for i in range(250):
        app.data.insert('users', [{
            'email': 'foo%s@bar.com' % i,
            'first_name': 'Foo%s' % i,
            'is_enabled': True,
            'receive_email': True,
            'company': '',
        }])

    resp = client.get('/users/search?q=fo')
    data = json.loads(resp.get_data())
    assert 250 == len(data)
