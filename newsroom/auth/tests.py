from tests import TestCase
from flask import url_for


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
                                          'password2': 'abc'})
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
