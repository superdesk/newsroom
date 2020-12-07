from flask import json
from bson import ObjectId
import urllib.parse


def test_api_tokens_create(client):
    response = client.post('/news_api_tokens', data=json.dumps({'company': '5b504318975bd5227e5ea0b9'}),
                           content_type='application/json')
    data = json.loads(response.get_data())
    assert 'token' in data
    assert response.status_code == 201


def test_api_tokens_create_expired(client):
    response = client.post('/news_api_tokens', data=json.dumps({'company': '5b504318975bd5227e5ea0b9',
                                                                'expiry': '1999-08-22T04:23:06+0000'}),
                           content_type='application/json')
    data = json.loads(response.get_data())
    assert 'error' in data
    assert response.status_code == 400


def test_api_tokens_create_only_one_per_company(client):
    response = client.post('/news_api_tokens', data=json.dumps({'company': '5b504318975bd5227e5ea0b9'}),
                           content_type='application/json')
    data = json.loads(response.get_data())
    assert 'token' in data
    assert response.status_code == 201
    response = client.post('/news_api_tokens', data=json.dumps({'company': '5b504318975bd5227e5ea0b9'}),
                           content_type='application/json')
    data = json.loads(response.get_data())
    assert 'error' in data
    assert response.status_code == 400


def test_api_tokens_patch(client, app):
    data = app.data.insert('news_api_tokens', [
        {
            "company": ObjectId("5b504318975bd5227e5ea0b9"),
            "enabled": True,
        }])
    response = client.patch('/news_api_tokens?token={}'.format(urllib.parse.quote(data[0])), data=json.dumps(
        {
            "enabled": False,
            "expiry": "2023-08-22T04:23:06+0000"
        }),
                            content_type='application/json')
    data = json.loads(response.get_data())
    assert data.get('enabled') is False
    assert response.status_code == 200
