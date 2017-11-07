
from flask import json
from bson import ObjectId

from .fixtures import items, init_items, init_auth  # noqa


def test_item_detail(client):
    resp = client.get('/wire/tag:foo')
    assert resp.status_code == 200
    html = resp.get_data().decode('utf-8')
    assert 'Amazon Is Opening More Bookstores' in html


def test_item_json(client):
    resp = client.get('/wire/tag:foo?format=json')
    data = json.loads(resp.get_data())
    assert 'headline' in data


def test_share_items(client, app):
    user_ids = app.data.insert('users', [{
        'email': 'foo@bar.com',
        'first_name': 'Foo',
        'last_name': 'Bar',
    }])

    with app.mail.record_messages() as outbox:
        resp = client.post('/wire_share', data=json.dumps({
            'items': [item['_id'] for item in items],
            'users': [str(user_ids[0])],
            'message': 'Some info message',
        }), content_type='application/json')

        assert resp.status_code == 201, resp.get_data().decode('utf-8')
        assert len(outbox) == 1
        assert outbox[0].recipients == ['foo@bar.com']
        assert outbox[0].sender == 'admin@sourcefabric.org'
        assert outbox[0].subject == 'From AAP Newsroom: %s' % items[0]['headline']
        assert 'Hi Foo Bar' in outbox[0].body
        assert 'admin admin shared ' in outbox[0].body
        assert items[0]['headline'] in outbox[0].body
        assert items[1]['headline'] in outbox[0].body
        assert 'http://localhost:5050/wire/%s' % items[0]['_id'] in outbox[0].body
        assert 'http://localhost:5050/wire/%s' % items[1]['_id'] in outbox[0].body
        assert 'Some info message' in outbox[0].body


def get_bookmarks_count(client, user):
    resp = client.get('/api/wire_search?bookmarks=%s' % str(user))
    assert resp.status_code == 200
    data = json.loads(resp.get_data())
    return data['_meta']['total']


def test_bookmarks(client, app):
    user_id = app.data.find_all('users')[0]['_id']
    assert user_id

    assert 0 == get_bookmarks_count(client, user_id)

    resp = client.post('/wire_bookmark', data=json.dumps({
        'items': [items[0]['_id']],
    }), content_type='application/json')
    assert resp.status_code == 200

    assert 1 == get_bookmarks_count(client, user_id)

    client.delete('/wire_bookmark', data=json.dumps({
        'items': [items[0]['_id']],
    }), content_type='application/json')
    assert resp.status_code == 200

    assert 0 == get_bookmarks_count(client, user_id)


def test_versions(client, app):
    resp = client.get('/wire/%s/versions' % items[0]['_id'])
    assert 200 == resp.status_code
    data = json.loads(resp.get_data())
    assert len(data.get('_items')) == 0

    resp = client.get('/wire/%s/versions' % items[1]['_id'])
    data = json.loads(resp.get_data())
    assert 2 == len(data['_items'])
    assert 'tag:weather' == data['_items'][0]['_id']


def test_search_filters_items_with_updates(client, app):
    resp = client.get('/search')
    data = json.loads(resp.get_data())
    assert 2 == len(data['_items'])
    assert 'tag:weather' not in [item['_id'] for item in data['_items']]


def test_search_filters_killed_items(client, app):
    app.data.insert('items', [{'_id': 'foo', 'pubstatus': 'canceled', 'headline': 'killed'}])
    resp = client.get('/search?q=headline:killed')
    data = json.loads(resp.get_data())
    assert 0 == len(data['_items'])


def test_search_filter_by_category(client, app):
    resp = client.get('/search?service=%s' % json.dumps({'a': True}))
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])
    assert '_aggregations' in data
    resp = client.get('/search?filter=%s' % json.dumps({'service': ['Service A']}))
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])


def test_company_user_gets_company_services(client, app):
    resp = client.post('companies/new', data={'name': 'Test'})
    company_id = json.loads(resp.get_data()).get('_id')
    resp = client.post('companies/%s/services' % company_id,
                       data=json.dumps({'services': {'b': True}}),
                       content_type='application/json')
    assert 200 == resp.status_code
    users = list(app.data.find_all('users'))
    assert 1 == len(users)
    app.data.update('users', users[0]['_id'], {'company': ObjectId(company_id)}, users[0])
    resp = client.get('/search')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])


def test_search_pagination(client):
    resp = client.get('/search?from=25')
    assert 200 == resp.status_code
    data = json.loads(resp.get_data())
    assert 0 == len(data['_items'])
    assert '_aggregations' not in data

    resp = client.get('/search?from=2000')
    assert 400 == resp.status_code


def test_search_created_from(client):
    resp = client.get('/search?created_from=now/d')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])


def test_search_created_to(client):
    resp = client.get('/search?created_to=now-1d/d')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])
