import datetime
from flask import url_for
from pytest import fixture
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

    app.data.insert('companies', [{
        '_id': 1,
        'name': 'Press co.',
        'is_enabled': False,
    }])


def test_new_user_signup_succeeds(app, client):
    # Register a new account
    response = client.post(url_for('auth.signup'), data={
        'email': 'newuser@abc.org',
        'email2': 'newuser@abc.org',
        'name': 'John Doe',
        'password': 'abc',
        'password2': 'abc',
        'country': 'Australia',
        'phone': '1234567',
        'company': 'Press co.',
        'company_size': '0-10',
        'occupation': 'Other'
    })
    assert response.status_code == 302

    # validate the email address
    user = list(app.data.find('users', req=None, lookup={'email': 'newuser@abc.org'}))[0]
    client.get(url_for('auth.validate_account', token=user['token']))

    # Login with the new account succeeds
    response = client.post(
        url_for('auth.login'),
        data={'email': 'newuser@abc.org', 'password': 'abc'},
        follow_redirects=True
    )
    assert response.status_code == 200
    assert 'John Doe' in response.get_data(as_text=True)

    # Logout
    response = client.get(url_for('auth.logout'), follow_redirects=True)
    txt = response.get_data(as_text=True)
    assert 'John Doe' not in txt
    assert 'Login' in txt


def test_new_user_signup_fails_if_email_exists(client):
    # Register a new account
    response = client.post(url_for('auth.signup'), data={
        'email': 'newuser@abc.org',
        'email2': 'newuser@abc.org',
        'name': 'John Doe',
        'password': 'abc',
        'password2': 'abc',
        'country': 'Australia',
        'phone': '1234567',
        'company': 'Press co.',
        'company_size': '0-10',
        'occupation': 'Other'
    })

    # Register another account with same email
    response = client.post(url_for('auth.signup'), data={
        'email': 'newuser@abc.org',
        'email2': 'newuser@abc.org',
        'name': 'John Smith',
        'password': '123',
        'password2': '123',
        'phone': '1234567',
        'country': 'Australia',
        'company': 'Press co.',
        'company_size': '0-10',
        'occupation': 'Other'
    })

    assert 'Email address is already in use' in response.get_data(as_text=True)


def test_new_user_signup_fails_if_fields_not_provided(client):
    # Register a new account
    response = client.post(url_for('auth.signup'), data={
        'email': 'newuser@abc.org',
        'email2': 'newuser@abc.org',
        'phone': '1234567',
        'password': 'abc',
        'password2': 'abc'
    })
    txt = response.get_data(as_text=True)
    assert 'company: This field is required' in txt
    assert 'company_size: Not a valid choice' in txt
    assert 'name: This field is required' in txt
    assert 'country: This field is required' in txt
    assert 'occupation: Not a valid choice' in txt


def test_new_user_signup_fails_if_passwords_do_not_match(client):
    # Register a new account
    response = client.post(url_for('auth.signup'), data={
        'email': 'newuser@abc.org',
        'email2': 'newuser@abc.org',
        'name': 'John Doe',
        'password': 'abc',
        'password2': '123',
        'country': 'Australia',
        'phone': '1234567',
        'company': 'Press co.',
        'company_size': '0-10',
        'occupation': 'Other'
    })
    assert 'password: Passwords must match' in response.get_data(as_text=True)


def test_new_user_has_correct_flags(client):
    # Register a new account
    response = client.post(url_for('auth.signup'), data={
        'email': 'newuser@abc.org',
        'email2': 'newuser@abc.org',
        'name': 'John Doe',
        'password': 'abc',
        'password2': 'abc',
        'country': 'Australia',
        'phone': '1234567',
        'company': 'Press co.',
        'company_size': '0-10',
        'occupation': 'Other'
    })
    assert response.status_code == 302
    user = get_resource_service('users').find_one(req=None, email='newuser@abc.org')
    assert not user['is_approved']
    assert user['is_enabled']
    assert not user['is_validated']


def test_login_fails_for_wrong_username_or_password(client):
    response = client.post(
        url_for('auth.login'),
        data={'email': 'xyz@abc.org', 'password': 'abc'},
        follow_redirects=True
    )
    assert 'Invalid username or password' in response.get_data(as_text=True)


def test_login_fails_for_disabled_user(client):
    response = client.post(url_for('auth.signup'), data={
        'email': 'newuser@abc.org',
        'email2': 'newuser@abc.org',
        'name': 'John Doe',
        'password': 'abc',
        'password2': 'abc',
        'country': 'Australia',
        'phone': '1234567',
        'company': 'Press co.',
        'company_size': '0-10',
        'occupation': 'Other'
    })
    assert response.status_code == 302
    user = get_resource_service('users').find_one(req=None, email='newuser@abc.org')
    get_resource_service('users').patch(id=user['_id'], updates={'is_enabled': False, 'is_validated': True})
    response = client.post(
        url_for('auth.login'),
        data={'email': 'newuser@abc.org', 'password': 'abc'},
        follow_redirects=True
    )
    # print(response.get_data(as_text=True))
    # print(response.status_code)
    assert 'Account is disabled' in response.get_data(as_text=True)


def test_login_fails_for_user_with_disabled_company(client):
    response = client.post(url_for('auth.signup'), data={
        'email': 'newuser@abc.org',
        'email2': 'newuser@abc.org',
        'name': 'John Doe',
        'password': 'abc',
        'password2': 'abc',
        'country': 'Australia',
        'phone': '1234567',
        'company': 'Press co.',
        'company_size': '0-10',
        'occupation': 'Other'
    })
    assert response.status_code == 302
    user = get_resource_service('users').find_one(req=None, email='newuser@abc.org')
    get_resource_service('users').patch(id=user['_id'],
                                        updates={'is_enabled': True, 'is_validated': True, 'company': 1})
    response = client.post(
        url_for('auth.login'),
        data={'email': 'newuser@abc.org', 'password': 'abc'},
        follow_redirects=True
    )
    assert 'Company account has been disabled' in response.get_data(as_text=True)


def test_login_for_user_with_enabled_company_succeeds(client):
    response = client.post(url_for('auth.signup'), data={
        'email': 'newuser@abc.org',
        'email2': 'newuser@abc.org',
        'name': 'John Doe',
        'password': 'abc',
        'password2': 'abc',
        'country': 'Australia',
        'phone': '1234567',
        'company': 'Press co.',
        'company_size': '0-10',
        'occupation': 'Other'
    })
    assert response.status_code == 302
    user = get_resource_service('users').find_one(req=None, email='newuser@abc.org')
    get_resource_service('users').patch(id=user['_id'],
                                        updates={'is_enabled': True, 'is_validated': True, 'company': 1})
    get_resource_service('companies').patch(id=1, updates={'is_enabled': True})
    response = client.post(
        url_for('auth.login'),
        data={'email': 'newuser@abc.org', 'password': 'abc'},
        follow_redirects=True
    )
    assert 'John Doe' in response.get_data(as_text=True)


def test_login_fails_for_not_approved_user(app, client):
    # If user is created more than 14 days ago login fails
    app.data.insert('users', [{
        '_id': 2,
        'name': 'test',
        'email': 'test@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'public',
        'is_validated': True,
        'is_enabled': True,
        'is_approved': False,
        '_created': datetime.datetime(2016, 4, 26, 13, 0, 33, tzinfo=datetime.timezone.utc),
    }])
    response = client.post(
        url_for('auth.login'),
        data={'email': 'test@sourcefabric.org', 'password': 'admin'},
        follow_redirects=True
    )
    assert 'Account has not been approved' in response.get_data(as_text=True)
