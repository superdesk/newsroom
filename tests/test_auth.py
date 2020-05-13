import datetime
from flask import url_for
from bson import ObjectId
from pytest import fixture
from superdesk import get_resource_service
from superdesk.utils import get_hash

from newsroom.auth.token import verify_auth_token
from newsroom.auth.views import _is_password_valid
from tests.test_users import init as users_init, ADMIN_USER_ID  # noqa
from .utils import mock_send_email
from unittest import mock

disabled_company = ObjectId()
expired_company = ObjectId()
company = ObjectId()


@fixture(autouse=True)
def init(app):
    app.data.insert('companies', [{
        '_id': disabled_company,
        'name': 'Press co.',
        'is_enabled': False,
    }, {
        '_id': expired_company,
        'name': 'Company co.',
        'is_enabled': True,
        'expiry_date': datetime.datetime.now() - datetime.timedelta(days=5),
    }, {
        '_id': company,
        'name': 'Foo bar co.',
        'is_enabled': True
    }])


@mock.patch('newsroom.email.send_email', mock_send_email)
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
        'company': company,
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
        'company': disabled_company,
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


def test_login_succesfull_for_user_with_expired_company(app, client):
    # Register a new account
    app.data.insert('users', [{
        '_id': ObjectId(),
        'first_name': 'test',
        'last_name': 'test',
        'email': 'test@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'public',
        'company': expired_company,
        'is_validated': True,
        'is_enabled': True,
        '_created': datetime.datetime(2016, 4, 26, 13, 0, 33, tzinfo=datetime.timezone.utc),
    }])

    response = client.post(
        url_for('auth.login'),
        data={'email': 'test@sourcefabric.org', 'password': 'admin'},
        follow_redirects=True
    )
    assert 'test' in response.get_data(as_text=True)


def test_login_for_user_with_enabled_company_succeeds(app, client):
    # Register a new account
    app.data.insert('users', [{
        '_id': ObjectId(),
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'test@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'public',
        'company': disabled_company,
        'is_validated': True,
        'is_approved': True,
        'is_enabled': True,
        '_created': datetime.datetime(2016, 4, 26, 13, 0, 33, tzinfo=datetime.timezone.utc),
    }])

    get_resource_service('companies').patch(id=disabled_company, updates={'is_enabled': True})
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
        'company': company,
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
        'company': disabled_company,
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
        'company': disabled_company,
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
            data={'email': 'xyz@abc.org', 'password': 'abc'},
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
        'company': disabled_company,
        'is_validated': True,
        'is_approved': True,
        'is_enabled': True,
        '_created': datetime.datetime(2016, 4, 26, 13, 0, 33, tzinfo=datetime.timezone.utc),
    }])

    get_resource_service('companies').patch(id=disabled_company, updates={'is_enabled': True})

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


def test_is_user_valid_empty_password(client):
    password = 'foo'.encode('utf-8')
    assert not _is_password_valid(password, {'_id': 'foo', 'email': 'foo@example.com'})
    assert not _is_password_valid(password, {'_id': 'foo', 'email': 'foo@example.com', 'password': None})
    assert not _is_password_valid(password, {'_id': 'foo', 'email': 'foo@example.com', 'password': ''})
    assert _is_password_valid(password, {'_id': 'foo', 'email': 'foo@example.com', 'password': get_hash('foo', 10)})


def test_login_for_public_user_if_company_not_assigned(client, app):
    app.data.insert('users', [{
        '_id': ObjectId(),
        'first_name': 'test',
        'last_name': 'test',
        'email': 'test@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'public',
        'is_validated': True,
        'is_enabled': True,
        'is_approved': True,
        '_created': datetime.datetime(2016, 4, 26, 13, 0, 33, tzinfo=datetime.timezone.utc),
    }])

    response = client.post(
        url_for('auth.login'),
        data={'email': 'test@sourcefabric.org', 'password': 'admin'},
        follow_redirects=True
    )
    assert 'Insufficient Permissions. Access denied.' in response.get_data(as_text=True)


def test_login_for_internal_user_if_company_not_assigned(client, app):
    app.data.insert('users', [{
        '_id': ObjectId(),
        'first_name': 'test',
        'last_name': 'test',
        'email': 'test@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'internal',
        'is_validated': True,
        'is_enabled': True,
        'is_approved': True,
        '_created': datetime.datetime(2016, 4, 26, 13, 0, 33, tzinfo=datetime.timezone.utc),
    }])

    response = client.post(
        url_for('auth.login'),
        data={'email': 'test@sourcefabric.org', 'password': 'admin'},
        follow_redirects=True
    )
    assert 'Insufficient Permissions. Access denied.' in response.get_data(as_text=True)


def test_access_for_disabled_user(app, client):
    # Register a new account
    user_id = ObjectId()
    app.data.insert('users', [{
        '_id': user_id,
        'first_name': 'test',
        'last_name': 'test',
        'email': 'test@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'administrator',
        'phone': '123456',
        'is_validated': True,
        'is_enabled': True,
        'is_approved': True,
        'company': company,
        '_created': datetime.datetime(2016, 4, 26, 13, 0, 33, tzinfo=datetime.timezone.utc),
    }])

    user = get_resource_service('users').find_one(req=None, _id=user_id)

    with client.session_transaction() as session:
        session['user'] = str(user_id)
        session['user_type'] = 'administrator'
        session['name'] = 'public'
    resp = client.get('/bookmarks_wire')
    assert 200 == resp.status_code

    with client.session_transaction() as session:
        session['user'] = ADMIN_USER_ID
        session['user_type'] = 'administrator'
        session['name'] = 'Admin'
    resp = client.post('/users/{}'.format(user_id), data={
        '_id': user_id,
        'first_name': 'test test',
        'last_name': 'test1',
        'email': 'test@sourcefabric.org',
        'user_type': 'administrator',
        'phone': '1234567',
        'is_validated': 'true',
        'is_enabled': 'false',
        'is_approved': 'true',
        'company': company,
        '_etag': user.get('_etag')
    })
    assert 200 == resp.status_code

    with client.session_transaction() as session:
        session['user'] = str(user_id)
        session['user_type'] = 'administrator'
        session['name'] = 'public'
    resp = client.get('/users/search')
    assert 403 == resp.status_code

    resp = client.get('/wire')
    assert 302 == resp.status_code


def test_access_for_disabled_company(app, client):
    # Register a new account
    user_id = ObjectId()
    app.data.insert('users', [{
        '_id': user_id,
        'first_name': 'test',
        'last_name': 'test',
        'email': 'test@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'administrator',
        'phone': '123456',
        'is_validated': True,
        'is_enabled': True,
        'is_approved': True,
        'company': disabled_company,
        '_created': datetime.datetime(2016, 4, 26, 13, 0, 33, tzinfo=datetime.timezone.utc),
    }])

    with client.session_transaction() as session:
        session['user'] = str(user_id)
        session['user_type'] = 'administrator'
        session['name'] = 'public'
    resp = client.get('/bookmarks_wire')
    assert 302 == resp.status_code
