import datetime
from flask import url_for
from bson import ObjectId
from pytest import fixture
from superdesk import get_resource_service
from tests.test_users import init as users_init


@fixture(autouse=True)
def init(app):
    users_init(app)
    app.data.insert('companies', [{
        '_id': 1,
        'name': 'Press co.',
        'is_enabled': False,
    }])


def test_new_user_signup_sends_email(app, client):
    app.config['SIGNUP_EMAIL_RECIPIENTS'] = 'admin@bar.com'
    with app.mail.record_messages() as outbox:
        # Sign up
        response = client.post(url_for('auth.signup'), data={
            'email': 'newuser@abc.org',
            'first_name': 'John',
            'last_name': 'Doe',
            'country': 'Australia',
            'phone': '1234567',
            'company': 'Press co.',
            'company_size': '0-10',
            'occupation': 'Other'
        })
        assert response.status_code == 200

        assert len(outbox) == 1
        assert outbox[0].recipients == ['admin@bar.com']
        assert outbox[0].subject == 'A new newsroom signup request'
        assert 'newuser@abc.org' in outbox[0].body
        assert 'John' in outbox[0].body
        assert 'Doe' in outbox[0].body
        assert '1234567' in outbox[0].body
        assert 'Press co.' in outbox[0].body


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


def test_login_fails_for_wrong_username_or_password(client):
    response = client.post(
        url_for('auth.login'),
        data={'email': 'xyz@abc.org', 'password': 'abc'},
        follow_redirects=True
    )
    assert 'Invalid username or password' in response.get_data(as_text=True)


def test_login_fails_for_disabled_user(app, client):
    # Register a new account
    app.data.insert('users', [{
        '_id': ObjectId(),
        'first_name': 'test',
        'last_name': 'test',
        'email': 'test@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'public',
        'is_validated': True,
        'is_enabled': False,
        'is_approved': True,
        '_created': datetime.datetime(2016, 4, 26, 13, 0, 33, tzinfo=datetime.timezone.utc),
    }])

    response = client.post(
        url_for('auth.login'),
        data={'email': 'test@sourcefabric.org', 'password': 'admin'},
        follow_redirects=True
    )
    assert 'Account is disabled' in response.get_data(as_text=True)


def test_login_fails_for_user_with_disabled_company(app, client):
    # Register a new account
    app.data.insert('users', [{
        '_id': ObjectId(),
        'first_name': 'test',
        'last_name': 'test',
        'email': 'test@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'public',
        'company': 1,
        'is_validated': True,
        'is_enabled': True,
        '_created': datetime.datetime(2016, 4, 26, 13, 0, 33, tzinfo=datetime.timezone.utc),
    }])

    response = client.post(
        url_for('auth.login'),
        data={'email': 'test@sourcefabric.org', 'password': 'admin'},
        follow_redirects=True
    )
    assert 'Company account has been disabled' in response.get_data(as_text=True)


def test_login_for_user_with_enabled_company_succeeds(app, client):
    # Register a new account
    app.data.insert('users', [{
        '_id': ObjectId(),
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'test@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'public',
        'company': 1,
        'is_validated': True,
        'is_approved': True,
        'is_enabled': True,
        '_created': datetime.datetime(2016, 4, 26, 13, 0, 33, tzinfo=datetime.timezone.utc),
    }])

    get_resource_service('companies').patch(id=1, updates={'is_enabled': True})
    response = client.post(
        url_for('auth.login'),
        data={'email': 'test@sourcefabric.org', 'password': 'admin'},
        follow_redirects=True
    )
    assert 'John Doe' in response.get_data(as_text=True)


def test_login_fails_for_not_approved_user(app, client):
    # If user is created more than 14 days ago login fails
    app.data.insert('users', [{
        '_id': ObjectId(),
        'first_name': 'test',
        'last_name': 'test',
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
