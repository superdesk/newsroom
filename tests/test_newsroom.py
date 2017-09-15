import json


def test_homepage(client):
    response = client.get('/')
    assert b'Newsroom' in response.data


def test_api_home(client):
    response = client.get('/api')
    assert 401 == response.status_code
    data = json.loads(response.data.decode())
    assert '_error' in data


def test_news_search(client):
    response = client.get('/search')
    assert 200 == response.status_code
    data = json.loads(response.data.decode())
    assert '_items' in data
    assert '_meta' in data
