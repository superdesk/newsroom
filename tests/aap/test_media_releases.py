from tests.fixtures import items, init_items, init_auth, init_company, PUBLIC_USER_ID  # noqa
from tests.utils import json, get_json, get_admin_user_id, mock_send_email
from tests.test_download import wire_formats, download_zip_file, items_ids, setup_image
from tests.test_push import get_signature_headers
from tests.test_users import ADMIN_USER_ID

from superdesk import get_resource_service
from superdesk.utc import utcnow

from flask import g
from datetime import datetime, timedelta
from urllib import parse
from unittest import mock
import zipfile


def test_blueprint_registration(client):
    resp = client.get('/media_releases')
    assert resp.status_code == 200


def test_item_detail(client):
    resp = client.get('/media_releases/tag:foo')
    assert resp.status_code == 200

    html = resp.get_data().decode('utf-8')
    assert 'Amazon Is Opening More Bookstores' in html


def test_item_json(client):
    resp = client.get('/media_releases/tag:foo?format=json')
    assert resp.status_code == 200

    data = json.loads(resp.get_data())
    assert 'headline' in data
    assert data['headline'] == 'Amazon Is Opening More Bookstores'


def get_bookmarks_count(client, user):
    resp = client.get('/api/media_releases_search?bookmarks=%s' % str(user))
    assert resp.status_code == 200
    data = json.loads(resp.get_data())
    return data['_meta']['total']


def test_bookmarks(client, app):
    user_id = get_admin_user_id(app)
    assert user_id

    assert 0 == get_bookmarks_count(client, user_id)

    resp = client.post('/media_releases_bookmark', data=json.dumps({
        'items': [items[0]['_id']],
    }), content_type='application/json')
    assert resp.status_code == 200

    assert 1 == get_bookmarks_count(client, user_id)

    client.delete('/media_releases_bookmark', data=json.dumps({
        'items': [items[0]['_id']],
    }), content_type='application/json')
    assert resp.status_code == 200

    assert 0 == get_bookmarks_count(client, user_id)


def test_bookmarks_by_section(client, app):
    products = [
        {
            "_id": 1,
            "name": "Service A",
            "query": "service.code: a",
            "is_enabled": True,
            "description": "Service A",
            "companies": ['1'],
            "sd_product_id": None,
            "product_type": "media_releases"
        }
    ]

    app.data.insert('products', products)
    product_id = app.data.find_all('products')[0]['_id']
    assert product_id == 1

    with client.session_transaction() as session:
        session['user'] = str(PUBLIC_USER_ID)
        session['user_type'] = 'public'
        session['name'] = 'public'

    assert 0 == get_bookmarks_count(client, PUBLIC_USER_ID)

    resp = client.post('/media_releases_bookmark', data=json.dumps({
        'items': [items[0]['_id']],
    }), content_type='application/json')
    assert resp.status_code == 200

    assert 1 == get_bookmarks_count(client, PUBLIC_USER_ID)

    client.delete('/media_releases_bookmark', data=json.dumps({
        'items': [items[0]['_id']],
    }), content_type='application/json')
    assert resp.status_code == 200

    assert 0 == get_bookmarks_count(client, PUBLIC_USER_ID)


def test_item_copy(client, app):
    resp = client.post(
        '/media_releases/{}/copy'.format(items[0]['_id']),
        content_type='application/json'
    )
    assert resp.status_code == 200

    resp = client.get('/media_releases/tag:foo?format=json')
    data = json.loads(resp.get_data())
    assert 'copies' in data

    user_id = get_admin_user_id(app)
    assert str(user_id) in data['copies']


def test_versions(client):
    resp = client.get('/media_releases/%s/versions' % items[0]['_id'])
    assert 200 == resp.status_code
    data = json.loads(resp.get_data())
    assert len(data.get('_items')) == 0

    resp = client.get('/media_releases/%s/versions' % items[1]['_id'])
    data = json.loads(resp.get_data())
    assert 2 == len(data['_items'])
    assert 'tag:weather' == data['_items'][0]['_id']
    assert 'AAP' == data['_items'][0]['source']
    assert 'c' == data['_items'][1]['service'][0]['code']


def test_search_by_products_id(client, app):
    app.data.insert('items', [
        {'_id': 'foo', 'headline': 'product test', 'products': [{'code': '12345'}]}
    ])
    resp = client.get('/media_releases/search?q=products.code:12345')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])


def test_filter_by_product_anonymous_user_gets_all(client):
    resp = client.get('/media_releases/search?products=%s' % json.dumps({'10': True}))
    data = json.loads(resp.get_data())
    assert 3 == len(data['_items'])
    assert '_aggregations' in data


def test_logged_in_user_no_product_gets_no_results(client):
    with client.session_transaction() as session:
        session['user'] = str(PUBLIC_USER_ID)
        session['user_type'] = 'public'
    resp = client.get('/media_releases/search')
    assert 403 == resp.status_code


def test_logged_in_user_no_company_gets_no_results(client):
    with client.session_transaction() as session:
        session['user'] = str(PUBLIC_USER_ID)
        session['user_type'] = 'public'

    resp = client.get('/media_releases/search')
    assert resp.status_code == 403


def test_administrator_gets_all_results(client):
    with client.session_transaction() as session:
        session['user'] = ADMIN_USER_ID
        session['user_type'] = 'administrator'

    resp = client.get('/media_releases/search')
    data = json.loads(resp.get_data())
    assert 3 == len(data['_items'])


def test_search_filtered_by_users_products(client, app):
    app.data.insert('products', [{
        '_id': 10,
        'name': 'product test',
        'sd_product_id': '1',
        'companies': ['1'],
        'is_enabled': True,
        'product_type': 'media_releases'
    }])

    with client.session_transaction() as session:
        session['user'] = str(PUBLIC_USER_ID)
        session['user_type'] = 'public'

    resp = client.get('/media_releases/search')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])
    assert '_aggregations' in data


def test_search_pagination(client):
    resp = client.get('/media_releases/search?from=25')
    assert 200 == resp.status_code
    data = json.loads(resp.get_data())
    assert 0 == len(data['_items'])
    assert '_aggregations' not in data

    resp = client.get('/media_releases/search?from=2000')
    assert 400 == resp.status_code


def test_search_created_from(client):
    resp = client.get('/media_releases/search?created_from=now/d')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])

    resp = client.get('/media_releases/search?created_from=now/w')
    data = json.loads(resp.get_data())
    assert 1 <= len(data['_items'])

    resp = client.get('/media_releases/search?created_from=now/M')
    data = json.loads(resp.get_data())

    assert 1 <= len(data['_items'])


def test_search_created_to(client):
    resp = client.get('/media_releases/search?created_to=%s' % datetime.now().strftime('%Y-%m-%d'))
    data = json.loads(resp.get_data())
    assert 3 == len(data['_items'])

    resp = client.get('/media_releases/search?created_to=%s&timezone_offset=%s' % (
        (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d'),
        -120
    ))
    data = json.loads(resp.get_data())
    assert 0 == len(data['_items'])


def test_item_detail_access(client, app):
    item_url = '/media_releases/%s' % items[0]['_id']
    data = get_json(client, item_url)
    assert data['_access']
    assert data['body_html']

    # public user
    with client.session_transaction() as session:
        session['user'] = str(PUBLIC_USER_ID)
        session['user_type'] = 'public'

    # no access by default
    data = get_json(client, item_url)
    assert not data['_access']
    assert not data.get('body_html')

    # add product
    app.data.insert('products', [{
        '_id': 10,
        'name': 'matching product',
        'companies': ['1'],
        'is_enabled': True,
        'product_type': 'media_releases',
        'query': 'slugline:%s' % items[0]['slugline']
    }])

    # normal access
    data = get_json(client, item_url)
    assert data['_access']
    assert data['body_html']


def test_administrator_gets_results_based_on_section_filter(client, app):
    with client.session_transaction() as session:
        session['user'] = ADMIN_USER_ID
        session['user_type'] = 'administrator'

    app.data.insert('section_filters', [{
        '_id': 'f-1',
        'name': 'product test 2',
        'query': 'headline:Weather',
        'is_enabled': True,
        'filter_type': 'media_releases'
    }])

    resp = client.get('/media_releases/search')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])


def test_time_limited_access(client, app):
    app.data.insert('products', [{
        '_id': 10,
        'name': 'product test',
        'query': 'versioncreated:<=now-2d',
        'companies': ['1'],
        'is_enabled': True,
        'product_type': 'media_releases'
    }])

    with client.session_transaction() as session:
        session['user'] = str(PUBLIC_USER_ID)
        session['user_type'] = 'public'

    resp = client.get('/media_releases/search')
    data = json.loads(resp.get_data())
    assert 2 == len(data['_items'])

    g.settings['media_releases_time_limit_days']['value'] = 1
    resp = client.get('/media_releases/search')
    data = json.loads(resp.get_data())
    assert 0 == len(data['_items'])

    g.settings['media_releases_time_limit_days']['value'] = 100
    resp = client.get('/media_releases/search')
    data = json.loads(resp.get_data())
    assert 2 == len(data['_items'])

    g.settings['media_releases_time_limit_days']['value'] = 1
    company = app.data.find_one('companies', req=None, _id=1)
    app.data.update('companies', 1, {'archive_access': True}, company)
    resp = client.get('/media_releases/search')
    data = json.loads(resp.get_data())
    assert 2 == len(data['_items'])


def test_company_type_filter(client, app):
    app.data.insert('products', [{
        '_id': 10,
        'name': 'product test',
        'query': 'versioncreated:<=now-2d',
        'companies': ['1'],
        'is_enabled': True,
        'product_type': 'media_releases'
    }])

    with client.session_transaction() as session:
        session['user'] = str(PUBLIC_USER_ID)
        session['user_type'] = 'public'

    resp = client.get('/media_releases/search')
    data = json.loads(resp.get_data())
    assert 2 == len(data['_items'])

    app.config['COMPANY_TYPES'] = [
        dict(id='test', wire_must={'term': {'service.code': 'b'}}),
    ]

    company = app.data.find_one('companies', req=None, _id=1)
    app.data.update('companies', 1, {'company_type': 'test'}, company)

    resp = client.get('/media_releases/search')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])
    assert 'WEATHER' == data['_items'][0]['slugline']

    app.config['COMPANY_TYPES'] = [
        dict(id='test', wire_must_not={'term': {'service.code': 'b'}}),
    ]

    resp = client.get('/media_releases/search')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])
    assert 'WEATHER' != data['_items'][0]['slugline']


@mock.patch('newsroom.wire.views.send_email', mock_send_email)
def test_share_items(client, app):
    user_ids = app.data.insert('users', [{
        'email': 'foo@bar.com',
        'first_name': 'Foo',
        'last_name': 'Bar',
    }])

    with app.mail.record_messages() as outbox:
        resp = client.post('/wire_share?type=media_releases', data=json.dumps({
            'items': [item['_id'] for item in items],
            'users': [str(user_ids[0])],
            'message': 'Some info message',
        }), content_type='application/json')

        assert resp.status_code == 201, resp.get_data().decode('utf-8')
        assert len(outbox) == 1
        assert outbox[0].recipients == ['foo@bar.com']
        assert outbox[0].sender == 'newsroom@localhost'
        assert outbox[0].subject == 'From AAP Newsroom: %s' % items[0]['headline']
        assert 'Hi Foo Bar' in outbox[0].body
        assert 'admin admin (admin@sourcefabric.org) shared ' in outbox[0].body
        assert items[0]['headline'] in outbox[0].body
        assert items[1]['headline'] in outbox[0].body
        assert 'http://localhost:5050/media_releases?item=%s' % parse.quote(items[0]['_id']) in outbox[0].body
        assert 'http://localhost:5050/media_releases?item=%s' % parse.quote(items[1]['_id']) in outbox[0].body
        assert 'Some info message' in outbox[0].body

    resp = client.get('/media_releases/{}?format=json'.format(items[0]['_id']))
    data = json.loads(resp.get_data())
    assert 'shares' in data

    user_id = get_admin_user_id(app)
    assert str(user_id) in data['shares']


def test_download(client, app):
    setup_image(client, app)
    for _format in wire_formats:
        _file = download_zip_file(client, _format['format'], 'media_releases')
        with zipfile.ZipFile(_file) as zf:
            assert _format['filename'] in zf.namelist()
            content = zf.open(_format['filename']).read()
            if _format.get('test_content'):
                _format['test_content'](content)
    history = app.data.find('history', None, None)
    assert (len(wire_formats) * len(items_ids)) == history.count()
    assert 'download' == history[0]['action']
    assert history[0].get('user')
    assert history[0].get('versioncreated') + timedelta(seconds=2) >= utcnow()
    assert history[0].get('item') in items_ids
    assert history[0].get('version')
    assert history[0].get('company') is None
    assert history[0].get('section') == 'media_releases'


@mock.patch('newsroom.email.send_email', mock_send_email)
def test_notify_user_matches_for_new_item_in_history(client, app, mocker):
    company_ids = app.data.insert('companies', [{
        'name': 'Press co.',
        'is_enabled': True,
    }])

    user = {
        'email': 'foo@bar.com',
        'first_name': 'Foo',
        'is_enabled': True,
        'is_approved': True,
        'receive_email': True,
        'company': company_ids[0],
    }

    user_ids = app.data.insert('users', [user])
    user['_id'] = user_ids[0]

    app.data.insert('history', docs=[{
        'version': '1',
        '_id': 'bar',
    }], action='download', user=user, section='media_releases')

    with app.mail.record_messages() as outbox:
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

    assert len(outbox) == 1
    assert 'http://localhost:5050/media_releases?item=bar' in outbox[0].body


@mock.patch('newsroom.email.send_email', mock_send_email)
def test_notify_user_matches_for_new_item_in_bookmarks(client, app, mocker):
    app.data.insert('section_filters', [{
        '_id': 'f-1',
        'name': 'product test 1',
        'query': 'NOT service.code:a',
        'is_enabled': True,
        'filter_type': 'wire'
    }, {
        '_id': 'f-4',
        'name': 'product test 4',
        'query': 'NOT service.code:a',
        'is_enabled': True,
        'filter_type': 'am_news'
    }, {
        '_id': 'f-2',
        'name': 'product test 2',
        'query': 'service.code:a',
        'is_enabled': True,
        'filter_type': 'media_releases'
    }, {
        '_id': 'f-3',
        'name': 'product test 3',
        'query': 'NOT service.code:a',
        'is_enabled': True,
        'filter_type': 'aapX'
    }])

    app.data.insert('companies', [{
        '_id': '2',
        'name': 'Press co.',
        'is_enabled': True,
        'sections': {
            'aapX': True,
            'agenda': True,
            'wire': True,
            'am_news': True,
            'media_releases': True,
        }
    }])

    user = {
        'email': 'foo@bar.com',
        'first_name': 'Foo',
        'is_enabled': True,
        'is_approved': True,
        'receive_email': True,
        'company': '2',
    }

    user_ids = app.data.insert('users', [user])
    user['_id'] = user_ids[0]

    app.data.insert('products', [{
        "_id": 1,
        "name": "Service A",
        "query": "service.code: a",
        "is_enabled": True,
        "description": "Service A",
        "companies": ['2'],
        "sd_product_id": None,
        "product_type": "media_releases",
    }])

    app.data.insert('items', [{
        '_id': 'bar',
        'headline': 'testing',
        'service': [{'code': 'a', 'name': 'Service A'}],
        'products': [{'code': 1, 'name': 'product-1'}],
    }])

    with client.session_transaction() as session:
        session['user'] = user['_id']
        session['user_type'] = 'public'
        session['name'] = 'public'

    resp = client.post('/media_releases_bookmark', data=json.dumps({
        'items': ['bar'],
    }), content_type='application/json')
    assert resp.status_code == 200

    with app.mail.record_messages() as outbox:
        key = b'something random'
        app.config['PUSH_KEY'] = key
        data = json.dumps({'guid': 'bar', 'type': 'text', 'headline': 'this is a test'})
        push_mock = mocker.patch('newsroom.push.push_notification')
        headers = get_signature_headers(data, key)
        resp = client.post('/push', data=data, content_type='application/json', headers=headers)
        assert 200 == resp.status_code
        assert push_mock.call_args_list[0][0][0] == 'new_item'
        assert push_mock.call_args_list[1][0][0] == 'history_matches'
        assert push_mock.call_args[1]['item']['_id'] == 'bar'
        notification = get_resource_service('notifications').find_one(req=None, user=user_ids[0])
        assert notification['item'] == 'bar'

    assert len(outbox) == 1
    assert 'http://localhost:5050/media_releases?item=bar' in outbox[0].body
