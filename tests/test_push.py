
import io
import hmac
import bson
from flask import json
from datetime import datetime
from superdesk import get_resource_service
from newsroom.utils import get_entity_or_404


def get_signature_headers(data, key):
    mac = hmac.new(key, data.encode(), 'sha1')
    return {'x-superdesk-signature': 'sha1=%s' % mac.hexdigest()}


item = {
    'guid': 'foo',
    'type': 'text',
    'headline': 'Foo',
    'firstcreated': '2017-11-27T08:00:57+0000',
    'renditions': {
        'thumbnail': {
            'href': 'http://example.com/foo',
            'media': 'foo',
        }
    },
    'genre': [{'name': 'News', 'code': 'news'}],
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


def test_notify_topic_matches_for_new_item(client, app, mocker):
    user_ids = app.data.insert('users', [{
        'email': 'foo@bar.com',
        'first_name': 'Foo',
        'is_enabled': True,
        'receive_email': True,
    }])

    with client as cli:
        with client.session_transaction() as session:
            user = str(user_ids[0])
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


def test_notify_user_matches_for_new_item_in_history(client, app, mocker):
    company_ids = app.data.insert('companies', [{
        'name': 'Press co.',
        'is_enabled': True,
    }])

    user = {
        'email': 'foo@bar.com',
        'first_name': 'Foo',
        'is_enabled': True,
        'receive_email': True,
        'company': company_ids[0],
    }

    user_ids = app.data.insert('users', [user])
    user['_id'] = user_ids[0]

    app.data.insert('history', docs=[{
        'version': '1',
        '_id': 'bar',
    }], action='download', user=user)

    key = b'something random'
    app.config['PUSH_KEY'] = key
    data = json.dumps({'guid': 'bar', 'type': 'text', 'headline': 'this is a test'})
    push_mock = mocker.patch('newsroom.push.push_notification')
    headers = get_signature_headers(data, key)
    resp = client.post('/push', data=data, content_type='application/json', headers=headers)
    assert 200 == resp.status_code
    assert push_mock.call_args[1]['item']['_id'] == 'bar'
    assert len(push_mock.call_args[1]['users']) == 1

    notification = get_resource_service('notifications').find_one(req=None, user=user_ids[0])
    assert notification['item'] == 'bar'


def test_notify_user_matches_for_new_item_in_bookmarks(client, app, mocker):
    company_ids = app.data.insert('companies', [{
        'name': 'Press co.',
        'is_enabled': True,
    }])

    user = {
        'email': 'foo@bar.com',
        'first_name': 'Foo',
        'is_enabled': True,
        'receive_email': True,
        'company': company_ids[0],
    }

    user_ids = app.data.insert('users', [user])
    user['_id'] = user_ids[0]

    app.data.insert('items', [{'_id': 'bar', 'headline': 'testing', 'bookmarks': [user_ids[0]]}])

    key = b'something random'
    app.config['PUSH_KEY'] = key
    data = json.dumps({'guid': 'bar', 'type': 'text', 'headline': 'this is a test'})
    push_mock = mocker.patch('newsroom.push.push_notification')
    headers = get_signature_headers(data, key)
    resp = client.post('/push', data=data, content_type='application/json', headers=headers)
    assert 200 == resp.status_code
    assert push_mock.call_args[1]['item']['_id'] == 'bar'
    assert len(push_mock.call_args[1]['users']) == 1


def test_do_not_notify_inactive_user(client, app, mocker):
    user_ids = app.data.insert('users', [{
        'email': 'foo@bar.com',
        'first_name': 'Foo',
        'is_enabled': False,
        'receive_email': True,
    }])

    with client as cli:
        with client.session_transaction() as session:
            user = str(user_ids[0])
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
    push_mock.assert_called_once_with('new_item', item='foo')


def test_notify_checks_service_subscriptions(client, app, mocker):
    app.data.insert('companies', [{
        '_id': 1,
        'name': 'Press co.',
        'is_enabled': True,
        'services': {
            'a': True
        }
    }])

    user_ids = app.data.insert('users', [{
        'email': 'foo@bar.com',
        'first_name': 'Foo',
        'is_enabled': True,
        'receive_email': True,
        'company': 1
    }])

    app.data.insert('topics', [
        {'label': 'topic-1', 'query': 'test', 'user': user_ids[0], 'notifications': True},
        {'label': 'topic-2', 'query': 'mock', 'user': user_ids[0], 'notifications': True}])

    with client.session_transaction() as session:
        user = str(user_ids[0])
        session['user'] = user

    with app.mail.record_messages() as outbox:
        key = b'something random'
        app.config['PUSH_KEY'] = key
        data = json.dumps(
            {
                'guid': 'foo',
                'type': 'text',
                'headline': 'this is a test',
                'service': [
                    {
                        'name': 'Australian Weather',
                        'code': 'b'
                    }
                ]
            })
        headers = get_signature_headers(data, key)
        resp = client.post('/push', data=data, content_type='application/json', headers=headers)
        assert 200 == resp.status_code
    assert len(outbox) == 0


def test_send_notification_emails(client, app):
    user_ids = app.data.insert('users', [{
        'email': 'foo@bar.com',
        'first_name': 'Foo',
        'is_enabled': True,
        'receive_email': True,
    }])

    app.data.insert('topics', [
        {'label': 'topic-1', 'query': 'test', 'user': user_ids[0], 'notifications': True},
        {'label': 'topic-2', 'query': 'mock', 'user': user_ids[0], 'notifications': True}])

    with client.session_transaction() as session:
        user = str(user_ids[0])
        session['user'] = user

    with app.mail.record_messages() as outbox:
        key = b'something random'
        app.config['PUSH_KEY'] = key
        data = json.dumps({'guid': 'foo', 'type': 'text', 'headline': 'this is a test'})
        headers = get_signature_headers(data, key)
        resp = client.post('/push', data=data, content_type='application/json', headers=headers)
        assert 200 == resp.status_code
    assert len(outbox) == 1


def test_matching_topics(client, app):
    client.post('/push', data=json.dumps(item), content_type='application/json')
    search = get_resource_service('wire_search')
    users = {'foo': {'company': None}}
    companies = {}
    topics = [
        {'_id': 'created_to_old', 'created': {'to': '2017-01-01'}, 'user': 'foo'},
        {'_id': 'created_from_future', 'created': {'from': 'now/d'}, 'user': 'foo', 'timezone_offset': 60 * 28},
        {'_id': 'filter', 'filter': {'genre': ['other']}, 'user': 'foo'},
        {'_id': 'query', 'query': 'Foo', 'user': 'foo'},
    ]
    matching = search.get_matching_topics(item['guid'], topics, users, companies)
    assert ['query'] == matching


def test_push_parsed_dates(client, app):
    client.post('/push', data=json.dumps(item), content_type='application/json')
    parsed = get_entity_or_404(item['guid'], 'items')
    assert type(parsed['firstcreated']) == datetime
