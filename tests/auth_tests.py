from tests import TestCase
from flask import url_for
from superdesk import get_resource_service
import datetime


class AuthTestCases(TestCase):
    def setUp(self):
        self.client = self.app.test_client()
        with self.app.test_request_context(self.app.config.get('URL_PREFIX')):
            self.app.data.insert('users',
                                 [{'_id': 1,
                                   'name': 'admin',
                                   'email': 'admin@sourcefabric.org',
                                   'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
                                   'user_type': 'administrator',
                                   'is_validated': True,
                                   'is_enabled': True,
                                   'is_approved': True
                                   }])

    def test_new_user_signup_succeeds(self):
        # Register a new account
        response = self.client.post(url_for('auth.signup'),
                                    data={'email': 'newuser@abc.org',
                                          'email2': 'newuser@abc.org',
                                          'name': 'John Doe',
                                          'password': 'abc',
                                          'password2': 'abc',
                                          'country': 'Australia',
                                          'phone': '1234567',
                                          'company': 'Press co.',
                                          'company_size': '0-10',
                                          'occupation': 'Other'})
        self.assertTrue(response.status_code == 302)

        # Login with the new account succeeds
        response = self.client.post(url_for('auth.login'),
                                    data={'email': 'newuser@abc.org',
                                          'password': 'abc'},
                                    follow_redirects=True)
        assert 'John Doe' in response.get_data(as_text=True)

        # Logout
        response = self.client.get(url_for('auth.logout'), follow_redirects=True)
        self.assertTrue('John Doe' not in response.get_data(as_text=True))
        assert 'Login' in response.get_data(as_text=True)

    def test_new_user_signup_fails_if_email_exists(self):
        # Register a new account
        response = self.client.post(url_for('auth.signup'),
                                    data={'email': 'newuser@abc.org',
                                          'email2': 'newuser@abc.org',
                                          'name': 'John Doe',
                                          'password': 'abc',
                                          'password2': 'abc',
                                          'country': 'Australia',
                                          'phone': '1234567',
                                          'company': 'Press co.',
                                          'company_size': '0-10',
                                          'occupation': 'Other'})

        # Register another account with same email
        response = self.client.post(url_for('auth.signup'),
                                    data={'email': 'newuser@abc.org',
                                          'email2': 'newuser@abc.org',
                                          'name': 'John Smith',
                                          'password': '123',
                                          'password2': '123',
                                          'phone': '1234567',
                                          'country': 'Australia',
                                          'company': 'Press co.',
                                          'company_size': '0-10',
                                          'occupation': 'Other'})

        assert 'Email address is already in use' in response.get_data(as_text=True)

    def test_new_user_signup_fails_if_fields_not_provided(self):
        # Register a new account
        response = self.client.post(url_for('auth.signup'),
                                    data={'email': 'newuser@abc.org',
                                          'email2': 'newuser@abc.org',
                                          'phone': '1234567',
                                          'password': 'abc',
                                          'password2': 'abc'})
        assert 'company: This field is required' in response.get_data(as_text=True)
        assert 'company_size: Not a valid choice' in response.get_data(as_text=True)
        assert 'name: This field is required' in response.get_data(as_text=True)
        assert 'country: This field is required' in response.get_data(as_text=True)
        assert 'occupation: Not a valid choice' in response.get_data(as_text=True)

    def test_new_user_signup_fails_if_passwords_do_not_match(self):
        # Register a new account
        response = self.client.post(url_for('auth.signup'),
                                    data={'email': 'newuser@abc.org',
                                          'email2': 'newuser@abc.org',
                                          'name': 'John Doe',
                                          'password': 'abc',
                                          'password2': '123',
                                          'country': 'Australia',
                                          'phone': '1234567',
                                          'company': 'Press co.',
                                          'company_size': '0-10',
                                          'occupation': 'Other'})
        assert 'password: Passwords must match' in response.get_data(as_text=True)

    def test_new_user_has_correct_flags(self):
        # Register a new account
        response = self.client.post(url_for('auth.signup'),
                                    data={'email': 'newuser@abc.org',
                                          'email2': 'newuser@abc.org',
                                          'name': 'John Doe',
                                          'password': 'abc',
                                          'password2': 'abc',
                                          'country': 'Australia',
                                          'phone': '1234567',
                                          'company': 'Press co.',
                                          'company_size': '0-10',
                                          'occupation': 'Other'})
        self.assertTrue(response.status_code == 302)
        user = get_resource_service('users').find_one(req=None, email='newuser@abc.org')
        self.assertFalse(user['is_approved'])
        self.assertTrue(user['is_enabled'])
        self.assertFalse(user['is_validated'])

    def test_login_fails_for_wrong_username_or_password(self):
        response = self.client.post(url_for('auth.login'),
                                    data={'email': 'xyz@abc.org',
                                          'password': 'abc'},
                                    follow_redirects=True)
        assert 'Invalid username or password' in response.get_data(as_text=True)

    def test_login_fails_for_disabled_user(self):
        response = self.client.post(url_for('auth.signup'),
                                    data={'email': 'newuser@abc.org',
                                          'email2': 'newuser@abc.org',
                                          'name': 'John Doe',
                                          'password': 'abc',
                                          'password2': 'abc',
                                          'country': 'Australia',
                                          'phone': '1234567',
                                          'company': 'Press co.',
                                          'company_size': '0-10',
                                          'occupation': 'Other'})
        self.assertTrue(response.status_code == 302)
        user = get_resource_service('users').find_one(req=None, email='newuser@abc.org')
        get_resource_service('users').patch(id=user['_id'], updates={'is_enabled': False})
        response = self.client.post(url_for('auth.login'),
                                    data={'email': 'newuser@abc.org',
                                          'password': 'abc'},
                                    follow_redirects=True)
        # print(response.get_data(as_text=True))
        # print(response.status_code)
        assert 'Account is disabled' in response.get_data(as_text=True)

    def test_login_fails_for_not_approved_user(self):
        # If user is created more than 14 days ago login fails
        with self.app.test_request_context(self.app.config.get('URL_PREFIX')):
            self.app.data.insert('users',
                                 [{'_id': 2,
                                   'name': 'test',
                                   'email': 'test@sourcefabric.org',
                                   'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
                                   'user_type': 'public',
                                   'is_validated': True,
                                   'is_enabled': True,
                                   'is_approved': False,
                                   '_created': datetime.datetime(2016, 4, 26, 13, 0, 33, tzinfo=datetime.timezone.utc),
                                   }])
        response = self.client.post(url_for('auth.login'),
                                    data={'email': 'test@sourcefabric.org',
                                          'password': 'admin'},
                                    follow_redirects=True)
        assert 'Account has not been approved' in response.get_data(as_text=True)
