import json


def test_homepage(client):
    response = client.get('/')
    assert b'Newsroom' in response.data


def test_api_home(client):
    response = client.get('/api')
    assert 401 == response.status_code
    data = json.loads(response.data.decode())
    assert '_error' in data


def test_news_search_fails_for_anonymous_user(client):
    response = client.get('/search')
    assert 403 == response.status_code
