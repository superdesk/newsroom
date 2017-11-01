
import io
import hmac
import bson

from flask import json


def get_signature_headers(data, key):
    mac = hmac.new(key, data.encode(), 'sha1')
    return {'x-superdesk-signature': 'sha1=%s' % mac.hexdigest()}


item = {
    'guid': 'foo',
    'type': 'text',
    'renditions': {
        'thumbnail': {
            'href': 'http://example.com/foo',
            'media': 'foo',
        }
    },
    'associations': {
        'featured': {
            'type': 'picture',
            'renditions': {
                'thumbnail': {
                    'href': 'http://example.com/bar',
                    'media': 'bar',
                }
            }
        }
    }
}


def test_push_item_inserts_missing(client, app):
    assert not app.config['PUSH_KEY']

    resp = client.post('/push', data=json.dumps(item), content_type='application/json')
    assert 200 == resp.status_code
    resp = client.get('wire/foo?format=json')
    assert 200 == resp.status_code
    data = json.loads(resp.get_data())
    assert '/assets/foo' == data['renditions']['thumbnail']['href']
    assert '/assets/bar' == data['associations']['featured']['renditions']['thumbnail']['href']


def test_push_valid_signature(client, app, mocker):
    key = b'something random'
    app.config['PUSH_KEY'] = key
    data = json.dumps({'guid': 'foo', 'type': 'text'})
    headers = get_signature_headers(data, key)
    resp = client.post('/push', data=data, content_type='application/json', headers=headers)
    assert 200 == resp.status_code


def test_notify_invalid_signature(client, app):
    app.config['PUSH_KEY'] = b'foo'
    data = json.dumps({})
    headers = get_signature_headers(data, b'bar')
    resp = client.post('/push', data=data, content_type='application/json', headers=headers)
    assert 500 == resp.status_code


def test_push_binary(client):
    media_id = str(bson.ObjectId())

    resp = client.get('/push_binary/%s' % media_id)
    assert 404 == resp.status_code

    resp = client.post('/push_binary', data=dict(
        media_id=media_id,
        media=(io.BytesIO(b'binary'), media_id),
    ))
    assert 201 == resp.status_code

    resp = client.get('/push_binary/%s' % media_id)
    assert 200 == resp.status_code

    resp = client.get('/assets/%s' % media_id)
    assert 200 == resp.status_code


def test_push_binary_invalid_signature(client, app):
    app.config['PUSH_KEY'] = b'foo'
    resp = client.post('/push_binary', data=dict(
        media_id=str(bson.ObjectId()),
        media=(io.BytesIO(b'foo'), 'foo'),
    ))
    assert 500 == resp.status_code


def test_notify_for_new_item(client, app, mocker):
    with client as cli:
        with client.session_transaction() as session:
            user = str(bson.ObjectId())
            session['user'] = user
        resp = cli.post('api/users/%s/topics' % user, data={'label': 'bar', 'query': 'test', 'notifications': True})
        assert 201 == resp.status_code

    key = b'something random'
    app.config['PUSH_KEY'] = key
    data = json.dumps({'guid': 'foo', 'type': 'text', 'headline': 'this is a test'})
    push_mock = mocker.patch('newsroom.push.push_notification')
    headers = get_signature_headers(data, key)
    resp = client.post('/push', data=data, content_type='application/json', headers=headers)
    assert 200 == resp.status_code
    assert push_mock.call_args[1]['item']['_id'] == 'foo'
    assert len(push_mock.call_args[1]['topics']) == 1
