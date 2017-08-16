
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


if __name__ == '__main__':
    unittest.main()
