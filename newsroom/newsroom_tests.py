import json
import unittest
from newsroom import Newsroom


class NewsroomTestCase(unittest.TestCase):
    def setUp(self):
        self.app = Newsroom()
        self.app.testing = True
        self.client = self.app.test_client()

    def test_homepage(self):
        response = self.client.get('/')
        assert b'Newsroom' in response.data

    def test_api_home(self):
        response = self.client.get('/api')
        assert 401 == response.status_code
        data = json.loads(response.data.decode())
        assert '_error' in data


if __name__ == '__main__':
    unittest.main()
