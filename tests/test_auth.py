import datetime
from flask import url_for
from bson import ObjectId
from pytest import fixture
from superdesk import get_resource_service

from newsroom.auth.token import verify_auth_token
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
    assert 'John' in response.get_data(as_text=True)


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


def test_login_fails_for_many_times_gets_limited(client):
    for i in range(1, 100):
        response = client.post(
            url_for('auth.login'),
            data={'email': 'xyz{}@abc.org'.format(i), 'password': 'abc'},
            follow_redirects=True
        )
        if i <= 60:
            assert 'Invalid username or password' in response.get_data(as_text=True)
        else:
            assert '429 Too Many Requests' in response.get_data(as_text=True)
            break


def test_account_is_locked_after_5_wrong_passwords(app, client):
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
    for i in range(1, 10):
        response = client.post(
            url_for('auth.login'),
            data={'email': 'test@sourcefabric.org', 'password': 'wrongone'},
            follow_redirects=True
        )
        if i <= 5:
            assert 'Invalid username or password' in response.get_data(as_text=True)
        else:
            assert 'Your account has been locked' in response.get_data(as_text=True)
            break

    # get the user
    user = get_resource_service('users').find_one(req=None, email='test@sourcefabric.org')
    assert user['is_enabled'] is False


def test_account_stays_unlocked_after_few_wrong_attempts(app, client):
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
    for i in range(1, 4):
        response = client.post(
            url_for('auth.login'),
            data={'email': 'test@sourcefabric.org', 'password': 'wrongone'},
            follow_redirects=True
        )
        if i <= 5:
            assert 'Invalid username or password' in response.get_data(as_text=True)

    # correct login will clear the attempt count
    client.post(
        url_for('auth.login'),
        data={'email': 'test@sourcefabric.org', 'password': 'admin'},
        follow_redirects=True
    )

    # now logout
    response = client.get(url_for('auth.logout'), follow_redirects=True)

    # user can try 4 more times
    for i in range(1, 4):
        response = client.post(
            url_for('auth.login'),
            data={'email': 'test@sourcefabric.org', 'password': 'wrongone'},
            follow_redirects=True
        )
        if i <= 5:
            assert 'Invalid username or password' in response.get_data(as_text=True)

    # get the user
    user = get_resource_service('users').find_one(req=None, email='test@sourcefabric.org')
    assert user['is_enabled'] is True


def test_account_appears_locked_for_non_existing_user(client):
    for i in range(1, 10):
        response = client.post(
            url_for('auth.login'),
            data={'email': 'xyz@abc.org'.format(i), 'password': 'abc'},
            follow_redirects=True
        )
        if i <= 5:
            assert 'Invalid username or password' in response.get_data(as_text=True)
        else:
            assert 'Your account has been locked' in response.get_data(as_text=True)


def test_login_with_remember_me_selected_creates_permanent_session(app, client):
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

    # login with remember_me = None
    client.post(
        url_for('auth.login'),
        data={'email': 'test@sourcefabric.org', 'password': 'admin'},
        follow_redirects=True
    )

    with client.session_transaction() as session:
        assert session.permanent is False

    # now logout
    client.get(url_for('auth.logout'), follow_redirects=True)

    # login with remember_me = True
    client.post(
        url_for('auth.login'),
        data={
            'email': 'test@sourcefabric.org',
            'password': 'admin',
            'remember_me': True
        },
        follow_redirects=True
    )

    with client.session_transaction() as session:
        assert session.permanent is True


def test_login_token_fails_for_wrong_username_or_password(client):
    response = client.post(
        url_for('auth.get_login_token'),
        data={'email': 'xyz@abc.org', 'password': 'abc'}
    )
    assert 'Invalid username or password' in response.get_data(as_text=True)


def test_login_token_succeeds_for_correct_username_or_password(client):
    response = client.post(
        url_for('auth.get_login_token'),
        data={'email': 'admin@sourcefabric.org', 'password': 'admin'}
    )
    token = response.get_data(as_text=True)
    data = verify_auth_token(token)
    assert data['name'] == 'admin admin'


def test_login_with_token_fails_for_wrong_token(client):
    response = client.get('/login/token/1234')
    assert 'Invalid token' in response.get_data(as_text=True)


def test_login_with_token_succeeds_for_correct_token(client):
    response = client.post(
        url_for('auth.get_login_token'),
        data={'email': 'admin@sourcefabric.org', 'password': 'admin'}
    )
    token = response.get_data(as_text=True)
    client.get('/login/token/{}'.format(token), follow_redirects=True)

    with client.session_transaction() as session:
        assert session['user_type'] == 'administrator'
