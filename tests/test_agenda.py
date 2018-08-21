from flask import json

from .fixtures import items, init_items, agenda_items, init_agenda_items, init_auth, init_company  # noqa
from .utils import post_json, delete_json


def test_item_detail(client):
    resp = client.get('/agenda/urn:conference')
    assert resp.status_code == 200
    assert 'urn:conference' in resp.get_data().decode()
    assert 'Conference Planning' in resp.get_data().decode()


def test_item_json(client):
    resp = client.get('/agenda/urn:conference?format=json')
    data = json.loads(resp.get_data())
    assert 'headline' in data


def get_bookmarks_count(client, user):
    resp = client.get('/agenda/search?bookmarks=%s' % str(user))
    assert resp.status_code == 200
    data = json.loads(resp.get_data())
    return data['_meta']['total']


def test_bookmarks(client, app):
    user_id = app.data.find_all('users')[0]['_id']
    assert user_id

    assert 0 == get_bookmarks_count(client, user_id)

    resp = client.post('/bookmark?type=agenda', data=json.dumps({
        'items': ['urn:conference'],
    }), content_type='application/json')
    assert resp.status_code == 200

    assert 1 == get_bookmarks_count(client, user_id)

    client.delete('/bookmark?type=agenda', data=json.dumps({
        'items': ['urn:conference'],
    }), content_type='application/json')
    assert resp.status_code == 200

    assert 0 == get_bookmarks_count(client, user_id)


def test_item_copy(client, app):
    resp = client.post('/wire/{}/copy?type=agenda'.format('urn:conference'), content_type='application/json')
    assert resp.status_code == 200

    resp = client.get('/agenda/urn:conference?format=json')
    data = json.loads(resp.get_data())
    assert 'copies' in data

    user_id = app.data.find_all('users')[0]['_id']
    assert str(user_id) in data['copies']


def test_share_items(client, app):
    user_ids = app.data.insert('users', [{
        'email': 'foo@bar.com',
        'first_name': 'Foo',
        'last_name': 'Bar',
    }])

    with app.mail.record_messages() as outbox:
        resp = client.post('/wire_share?type=agenda', data=json.dumps({
            'items': ['urn:conference'],
            'users': [str(user_ids[0])],
            'message': 'Some info message',
        }), content_type='application/json')

        assert resp.status_code == 201, resp.get_data().decode('utf-8')
        assert len(outbox) == 1
        assert outbox[0].recipients == ['foo@bar.com']
        assert outbox[0].sender == 'admin@sourcefabric.org'
        assert outbox[0].subject == 'From AAP Newsroom: Conference Planning'
        assert 'Hi Foo Bar' in outbox[0].body
        assert 'admin admin shared ' in outbox[0].body
        assert 'Conference Planning' in outbox[0].body
        assert 'http://localhost:5050/agenda/urn:conference' in outbox[0].body
        assert 'Some info message' in outbox[0].body

    resp = client.get('/agenda/{}?format=json'.format('urn:conference'))
    data = json.loads(resp.get_data())
    assert 'shares' in data

    user_id = app.data.find_all('users')[0]['_id']
    assert str(user_id) in data['shares']


def test_agenda_search_filtered_by_query_product(client, app):
    app.data.insert('navigations', [{
        '_id': 51,
        'name': 'navigation-1',
        'is_enabled': True,
    }, {
        '_id': 52,
        'name': 'navigation-2',
        'is_enabled': True,
    }])

    app.data.insert('products', [{
        '_id': 12,
        'name': 'product test',
        'query': 'headline:test',
        'companies': ['1'],
        'navigations': ['51'],
        'is_enabled': True,
        'product_type': 'agenda',
    }, {
        '_id': 13,
        'name': 'product test 2',
        'query': 'slugline:prime',
        'companies': ['1'],
        'navigations': ['52'],
        'is_enabled': True,
        'product_type': 'agenda',
    }])

    with client.session_transaction() as session:
        session['user'] = '59b4c5c61d41c8d736852fbf'
        session['user_type'] = 'public'

    resp = client.get('/agenda/search')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])
    assert '_aggregations' in data
    resp = client.get('/agenda/search?navigation=51')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])
    assert '_aggregations' in data


def test_coverage_request(client, app):
    app.config['COVERAGE_REQUEST_RECIPIENTS'] = ['admin@bar.com']
    with app.mail.record_messages() as outbox:
        resp = client.post('/agenda/request_coverage', data=json.dumps({
            'item': ['urn:conference'],
            'message': 'Some info message',
        }), content_type='application/json')

        assert resp.status_code == 201, resp.get_data().decode('utf-8')
        assert len(outbox) == 1
        assert outbox[0].recipients == ['admin@bar.com']
        assert outbox[0].subject == 'A new coverage request'
        assert 'admin admin' in outbox[0].body
        assert 'admin@sourcefabric.org' in outbox[0].body
        assert 'http://localhost:5050/agenda/urn:conference' in outbox[0].body
        assert 'Some info message' in outbox[0].body


def test_watch_event(client, app):
    user_id = app.data.find_all('users')[0]['_id']
    assert 0 == get_bookmarks_count(client, user_id)

    post_json(client, '/agenda_watch', {'items': ['urn:conference']})
    assert 1 == get_bookmarks_count(client, user_id)

    delete_json(client, '/agenda_watch', {'items': ['urn:conference']})
    assert 0 == get_bookmarks_count(client, user_id)
