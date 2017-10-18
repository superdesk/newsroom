
import hmac

from flask import json


def get_signature_headers(data, key):
    mac = hmac.new(key, data.encode(), 'sha1')
    return {'x-superdesk-signature': 'sha1=%s' % mac.hexdigest()}


def test_notify_no_signature(client, app):
    resp = client.post('/notify', content_type='application/json')
    assert 500 == resp.status_code


def test_notify_valid_signature(client, app, mocker):
    assert app.config.get('NOTIFICATION_KEY')
    data = json.dumps({})
    push_mock = mocker.patch('newsroom.notification.push_notification')
    headers = get_signature_headers(data, app.config['NOTIFICATION_KEY'])
    resp = client.post('/notify', data=data, content_type='application/json', headers=headers)
    assert 200 == resp.status_code
    push_mock.assert_called_once_with('update')


def test_notify_invalid_signature(client, app):
    data = json.dumps({})
    headers = get_signature_headers(data, b'foo')
    resp = client.post('/notify', data=data, content_type='application/json', headers=headers)
    assert 500 == resp.status_code
