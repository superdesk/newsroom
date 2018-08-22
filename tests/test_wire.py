from flask import json
from bson import ObjectId
from datetime import datetime, timedelta

from .fixtures import items, init_items, init_auth, init_company  # noqa


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

    resp = client.get('/wire/{}?format=json'.format(items[0]['_id']))
    data = json.loads(resp.get_data())
    assert 'shares' in data

    user_id = app.data.find_all('users')[0]['_id']
    assert str(user_id) in data['shares']


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


def test_item_copy(client, app):
    resp = client.post('/wire/{}/copy'.format(items[0]['_id']), content_type='application/json')
    assert resp.status_code == 200

    resp = client.get('/wire/tag:foo?format=json')
    data = json.loads(resp.get_data())
    assert 'copies' in data

    user_id = app.data.find_all('users')[0]['_id']
    assert str(user_id) in data['copies']


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
    assert 3 == len(data['_items'])
    assert 'tag:weather' not in [item['_id'] for item in data['_items']]


def test_search_includes_killed_items(client, app):
    app.data.insert('items', [{'_id': 'foo', 'pubstatus': 'canceled', 'headline': 'killed'}])
    resp = client.get('/search?q=headline:killed')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])


def test_search_by_products_id(client, app):
    app.data.insert('items', [{'_id': 'foo', 'headline': 'product test', 'products': [{'code': '12345'}]}])
    resp = client.get('/search?q=products.code:12345')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])


def test_search_filter_by_category(client, app):
    resp = client.get('/search?filter=%s' % json.dumps({'service': ['Service A']}))
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])


def test_filter_by_product_anonymous_user_gets_all(client, app):
    resp = client.get('/search?products=%s' % json.dumps({'10': True}))
    data = json.loads(resp.get_data())
    assert 3 == len(data['_items'])
    assert '_aggregations' in data


def test_logged_in_user_no_product_gets_no_results(client, app):
    with client.session_transaction() as session:
        session['user'] = '59b4c5c61d41c8d736852fbf'
        session['user_type'] = 'public'
    resp = client.get('/search')
    assert 403 == resp.status_code


def test_logged_in_user_no_company_gets_no_results(client, app):
    with client.session_transaction() as session:
        session['user'] = str(ObjectId())
        session['user_type'] = 'public'

    resp = client.get('/search')
    assert resp.status_code == 403


def test_administrator_gets_all_results(client, app):
    with client.session_transaction() as session:
        session['user'] = str(ObjectId())
        session['user_type'] = 'administrator'

    resp = client.get('/search')
    data = json.loads(resp.get_data())
    assert 3 == len(data['_items'])


def test_search_filtered_by_users_products(client, app):
    app.data.insert('products', [{
        '_id': 10,
        'name': 'product test',
        'sd_product_id': 1,
        'companies': ['1'],
        'is_enabled': True,
    }])

    with client.session_transaction() as session:
        session['user'] = '59b4c5c61d41c8d736852fbf'
        session['user_type'] = 'public'

    resp = client.get('/search')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])
    assert '_aggregations' in data


def test_search_filter_by_individual_navigation(client, app):
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
        '_id': 10,
        'name': 'product test',
        'sd_product_id': 1,
        'companies': ['1'],
        'navigations': ['51'],
        'is_enabled': True,
    }, {
        '_id': 11,
        'name': 'product test 2',
        'sd_product_id': 2,
        'companies': ['1'],
        'navigations': ['52'],
        'is_enabled': True,
    }])
    with client.session_transaction() as session:
        session['user'] = '59b4c5c61d41c8d736852fbf'
        session['user_type'] = 'public'

    resp = client.get('/search')
    data = json.loads(resp.get_data())
    assert 2 == len(data['_items'])
    assert '_aggregations' in data
    resp = client.get('/search?navigation=51')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])
    assert '_aggregations' in data

    # test admin user filtering
    with client.session_transaction() as session:
        session['user_type'] = 'administrator'

    resp = client.get('/search')
    data = json.loads(resp.get_data())
    assert 3 == len(data['_items'])  # gets all by default

    resp = client.get('/search?navigation=51')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])


def test_search_filtered_by_query_product(client, app):
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
        'query': 'headline:more',
        'companies': ['1'],
        'navigations': ['51'],
        'is_enabled': True,
    }, {
        '_id': 13,
        'name': 'product test 2',
        'query': 'headline:Weather',
        'companies': ['1'],
        'navigations': ['52'],
        'is_enabled': True,
    }])

    with client.session_transaction() as session:
        session['user'] = '59b4c5c61d41c8d736852fbf'
        session['user_type'] = 'public'

    resp = client.get('/search')
    data = json.loads(resp.get_data())
    assert 2 == len(data['_items'])
    assert '_aggregations' in data
    resp = client.get('/search?navigation=52')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])
    assert '_aggregations' in data


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

    resp = client.get('/search?created_from=now/w')
    data = json.loads(resp.get_data())
    assert 1 <= len(data['_items'])

    resp = client.get('/search?created_from=now/M')
    data = json.loads(resp.get_data())
    assert 1 <= len(data['_items'])


def test_search_created_to(client):
    resp = client.get('/search?created_to=%s' % datetime.now().strftime('%Y-%m-%d'))
    data = json.loads(resp.get_data())
    assert 3 == len(data['_items'])

    resp = client.get('/search?created_to=%s&timezone_offset=%s' % (
        (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d'),
        -120
    ))
    data = json.loads(resp.get_data())
    assert 0 == len(data['_items'])
