from tests import TestCase
from flask import url_for


class UsersTestCases(TestCase):
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

    def test_user_list_fails_for_anonymous_user(self):
        response = self.client.get('/users')
        assert '403' in response.get_data(as_text=True)

    def test_login_succeeds_for_admin(self):
        response = self.client.post(url_for('auth.login'),
                                    data={'email': 'admin@sourcefabric.org',
                                          'password': 'admin'},
                                    follow_redirects=True)
        print(response.get_data(as_text=True))
        assert '<h5>There are no items yet.</h5>' in response.get_data(as_text=True)
