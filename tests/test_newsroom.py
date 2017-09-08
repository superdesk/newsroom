import json


def test_homepage(client):
    response = client.get('/')
    assert b'Newsroom' in response.data


def test_api_home(client):
    response = client.get('/api')
    assert 401 == response.status_code
    data = json.loads(response.data.decode())
    assert '_error' in data
