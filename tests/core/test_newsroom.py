import json


def test_homepage_requires_auth(client):
    response = client.get('/')
    assert 302 == response.status_code
    assert b'login' in response.data


def test_api_home(client):
    response = client.get('/api')
    assert 401 == response.status_code
    data = json.loads(response.data.decode())
    assert '_error' in data


def test_news_search_fails_for_anonymous_user(client):
    response = client.get('/wire/search')
    assert 403 == response.status_code


def test_agenda_search_fails_for_anonymous_user(client):
    response = client.get('/agenda/search')
    assert 302 == response.status_code
    assert b'login' in response.data
