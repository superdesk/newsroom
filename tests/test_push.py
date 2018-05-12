
import io
import os
import hmac
import bson
from bson import ObjectId
from flask import json
from datetime import datetime
from superdesk import get_resource_service
from newsroom.utils import get_entity_or_404
from .fixtures import init_auth


def get_signature_headers(data, key):
    mac = hmac.new(key, data.encode(), 'sha1')
    return {'x-superdesk-signature': 'sha1=%s' % mac.hexdigest()}


item = {
    'guid': 'foo',
    'type': 'text',
    'headline': 'Foo',
    'firstcreated': '2017-11-27T08:00:57+0000',
    'body_html': '<p>foo bar</p>',
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

    init_auth(app, client)
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


def get_fixture_path(fixture):
    return os.path.join(os.path.dirname(__file__), 'fixtures', fixture)


def upload_binary(fixture, client, media_id=None):
    if not media_id:
        media_id = str(bson.ObjectId())
    with open(get_fixture_path(fixture), mode='rb') as pic:
        resp = client.post('/push_binary', data=dict(
            media_id=media_id,
            media=(pic, 'picture.jpg'),
        ))

        assert 201 == resp.status_code
    return client.get('/assets/%s' % media_id)


def test_push_binary_thumbnail_saves_copy(client):
    resp = upload_binary('thumbnail.jpg', client)
    assert resp.content_type == 'image/jpeg'
    with open(get_fixture_path('thumbnail.jpg'), mode='rb') as picture:
        assert resp.content_length == len(picture.read())


def test_push_featuremedia_generates_renditions(client):
    media_id = str(bson.ObjectId())
    upload_binary('picture.jpg', client, media_id=media_id)
    item = {
        'guid': 'test',
        'type': 'text',
        'associations': {
            'featuremedia': {
                'type': 'picture',
                'mimetype': 'image/jpeg',
                'renditions': {
                    '4-3': {
                        'media': media_id,
                    },
                    'baseImage': {
                        'media': media_id,
                    },
                    'viewImage': {
                        'media': media_id,
                    }
                }
            }
        }
    }

    resp = client.post('/push', data=json.dumps(item), content_type='application/json')
    assert 200 == resp.status_code

    resp = client.get('/wire/test?format=json')
    data = json.loads(resp.get_data())
    assert 200 == resp.status_code
    picture = data['associations']['featuremedia']

    for name in ['thumbnail', 'thumbnail_large', 'view', 'base']:
        rendition = picture['renditions']['_newsroom_%s' % name]
        resp = client.get(rendition['href'])
        assert 200 == resp.status_code


def test_push_featuremedia_has_renditions_for_existing_media(client):
    media_id = str(bson.ObjectId())
    upload_binary('picture.jpg', client, media_id=media_id)
    item = {
        'guid': 'test',
        'type': 'text',
        'associations': {
            'featuremedia': {
                'type': 'picture',
                'mimetype': 'image/jpeg',
                'renditions': {
                    '4-3': {
                        'media': media_id,
                    },
                    'baseImage': {
                        'media': media_id,
                    },
                    'viewImage': {
                        'media': media_id,
                    }
                }
            }
        }
    }

    # First post
    resp = client.post('/push', data=json.dumps(item), content_type='application/json')
    assert 200 == resp.status_code

    # Second post
    resp = client.post('/push', data=json.dumps(item), content_type='application/json')
    assert 200 == resp.status_code

    resp = client.get('/wire/test?format=json')
    data = json.loads(resp.get_data())
    assert 200 == resp.status_code
    picture = data['associations']['featuremedia']

    for name in ['thumbnail', 'thumbnail_large', 'view', 'base']:
        rendition = picture['renditions']['_newsroom_%s' % name]
        assert media_id in rendition['href']
        resp = client.get(rendition['href'])
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
        'user_type': 'administrator'
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


def test_notify_user_matches_for_killed_item_in_history(client, app, mocker):
    company_ids = app.data.insert('companies', [{
        'name': 'Press co.',
        'is_enabled': True,
    }])

    user = {
        'email': 'foo@bar.com',
        'first_name': 'Foo',
        'is_enabled': True,
        'receive_email': False,  # should still get email
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
    data = json.dumps({
        'guid': 'bar',
        'type': 'text',
        'headline': 'Kill Notice',
        'slugline': 'Court',
        'description_html': 'This story is killed',
        'body_html': 'Killed story',
        'pubstatus': 'canceled'})
    push_mock = mocker.patch('newsroom.push.push_notification')
    headers = get_signature_headers(data, key)

    with app.mail.record_messages() as outbox:
        resp = client.post('/push', data=data, content_type='application/json', headers=headers)
        assert 200 == resp.status_code
        assert push_mock.call_args[1]['item']['_id'] == 'bar'
        assert len(push_mock.call_args[1]['users']) == 1
    assert len(outbox) == 1
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
        'user_type': 'administrator'
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

    users = {'foo': {'company': '1', 'user_type': 'administrator'}}
    companies = {'1': {'_id': 1, 'name': 'test-comp'}}
    topics = [
        {'_id': 'created_to_old', 'created': {'to': '2017-01-01'}, 'user': 'foo'},
        {'_id': 'created_from_future', 'created': {'from': 'now/d'}, 'user': 'foo', 'timezone_offset': 60 * 28},
        {'_id': 'filter', 'filter': {'genre': ['other']}, 'user': 'foo'},
        {'_id': 'query', 'query': 'Foo', 'user': 'foo'},
    ]
    matching = search.get_matching_topics(item['guid'], topics, users, companies)
    assert ['query'] == matching


def test_matching_topics_for_public_user(client, app):
    app.data.insert('products', [{
        '_id': ObjectId('59b4c5c61d41c8d736852fbf'),
        'name': 'Sport',
        'description': 'Top level sport product',
        'sd_product_id': 'p-1',
        'is_enabled': True,
        'companies': ['1'],
    }])

    item['products'] = [{'code': 'p-1'}]
    client.post('/push', data=json.dumps(item), content_type='application/json')
    search = get_resource_service('wire_search')

    users = {'foo': {'company': '1', 'user_type': 'public'}}
    companies = {'1': {'_id': '1', 'name': 'test-comp'}}
    topics = [
        {'_id': 'created_to_old', 'created': {'to': '2017-01-01'}, 'user': 'foo'},
        {'_id': 'created_from_future', 'created': {'from': 'now/d'}, 'user': 'foo', 'timezone_offset': 60 * 28},
        {'_id': 'filter', 'filter': {'genre': ['other']}, 'user': 'foo'},
        {'_id': 'query', 'query': 'Foo', 'user': 'foo'},
    ]
    matching = search.get_matching_topics(item['guid'], topics, users, companies)
    assert ['query'] == matching


def test_push_parsed_item(client, app):
    client.post('/push', data=json.dumps(item), content_type='application/json')
    parsed = get_entity_or_404(item['guid'], 'wire_search')
    assert type(parsed['firstcreated']) == datetime
    assert 2 == parsed['word_count']


def test_push_parsed_dates(client, app):
    client.post('/push', data=json.dumps(item), content_type='application/json')
    parsed = get_entity_or_404(item['guid'], 'items')
    assert type(parsed['firstcreated']) == datetime
