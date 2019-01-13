import pytz
from flask import json
from datetime import datetime, timedelta
from superdesk.utc import utc_to_local, local_to_utc
from newsroom.wire.utils import get_local_date, get_end_date
from newsroom.agenda.utils import get_location_string, get_agenda_dates, get_public_contacts

from .fixtures import items, init_items, agenda_items, init_agenda_items, init_auth, init_company, PUBLIC_USER_ID  # noqa
from .utils import post_json, delete_json, get_json


def test_item_detail(client):
    resp = client.get('/agenda/urn:conference')
    assert resp.status_code == 200
    assert 'urn:conference' in resp.get_data().decode()
    assert 'Conference Planning' in resp.get_data().decode()


def test_item_json(client):
    resp = client.get('/agenda/urn:conference?format=json')
    data = json.loads(resp.get_data())
    assert 'headline' in data
    assert 'files' in data['event']
    assert 'internal_note' in data['event']
    assert 'internal_note' in data['planning_items'][0]
    assert 'internal_note' in data['coverages'][0]['planning']


def test_item_json_does_not_return_files(client, app):
    # public user
    with client.session_transaction() as session:
        session['user'] = PUBLIC_USER_ID
        session['user_type'] = 'public'

    data = get_json(client, '/agenda/urn:conference?format=json')
    assert 'headline' in data
    assert 'files' not in data['event']
    assert 'internal_note' not in data['event']
    assert 'internal_note' not in data['planning_items'][0]
    assert 'internal_note' not in data['coverages'][0]['planning']


def get_bookmarks_count(client, user):
    resp = client.get('/agenda/search?bookmarks=%s' % str(user))
    assert resp.status_code == 200
    data = json.loads(resp.get_data())
    return data['_meta']['total']


def test_bookmarks(client, app):
    user_id = app.data.find_all('users')[0]['_id']
    assert user_id

    assert 0 == get_bookmarks_count(client, user_id)

    resp = client.post('/agenda_bookmark', data=json.dumps({
        'items': ['urn:conference'],
    }), content_type='application/json')
    assert resp.status_code == 200

    assert 1 == get_bookmarks_count(client, user_id)

    client.delete('/agenda_bookmark', data=json.dumps({
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
        'product_type': 'agenda'
    }, {
        '_id': 52,
        'name': 'navigation-2',
        'is_enabled': True,
        'product_type': 'agenda'
    }])

    app.data.insert('products', [{
        '_id': 12,
        'name': 'product test',
        'query': 'headline:test',
        'companies': ['1'],
        'navigations': ['51'],
        'is_enabled': True,
        'product_type': 'agenda'
    }, {
        '_id': 13,
        'name': 'product test 2',
        'query': 'slugline:prime',
        'companies': ['1'],
        'navigations': ['52'],
        'is_enabled': True,
        'product_type': 'agenda'
    }])

    with client.session_transaction() as session:
        session['user'] = '59b4c5c61d41c8d736852fbf'
        session['user_type'] = 'public'

    resp = client.get('/agenda/search')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])
    assert '_aggregations' in data
    assert 'files' not in data['_items'][0]['event']
    assert 'internal_note' not in data['_items'][0]['event']
    assert 'internal_note' not in data['_items'][0]['planning_items'][0]
    assert 'internal_note' not in data['_items'][0]['coverages'][0]['planning']
    resp = client.get('/agenda/search?navigation=51')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])
    assert '_aggregations' in data


def test_coverage_request(client, app):
    app.config['COVERAGE_REQUEST_RECIPIENTS'] = 'admin@bar.com'
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


def test_featured(client, app):
    app.data.insert('products', [{
        '_id': 12,
        'name': 'product test',
        'query': '_featured',
        'companies': ['1'],
        'navigations': ['51'],
        'is_enabled': True,
        'product_type': 'agenda'
    }, {
        '_id': 13,
        'name': 'all items',
        'query': '*:*',
        'companies': ['1'],
        'navigations': ['51'],
        'is_enabled': True,
        'product_type': 'agenda'
    }])

    _items = []
    for i in range(5):
        item = agenda_items[0].copy()
        item['_id'] = 'urn:item:%d' % i
        item['slugline'] = 'event slugline'
        item['dates'] = item['dates'].copy()
        item['dates']['start'] += timedelta(hours=1)
        item['planning_items'] = [{'_id': 'urn:plan:%d' % i, 'guid': 'urn:plan:%d' % i}]
        _items.append(item)
    app.data.insert('agenda', _items)

    # post first 2 items
    date = utc_to_local('Australia/Sydney', datetime.utcnow().replace(microsecond=0))
    _id = date.strftime('%Y%m%d')
    featured = {
        '_id': _id,
        'type': 'planning_featured',
        'item_id': _id,
        'items': [item['planning_items'][0]['guid'] for item in _items[:2]],
        'tz': 'Australia/Sydney',
    }
    resp = post_json(client, 'push', featured)
    assert 200 == resp.status_code

    # public user
    with client.session_transaction() as session:
        session['user'] = PUBLIC_USER_ID
        session['user_type'] = 'public'

    data = get_json(client, '/agenda/search?navigation=51')
    assert 2 == data['_meta']['total']
    assert _items[0]['_id'] == data['_items'][0]['_id']
    assert _items[1]['_id'] == data['_items'][1]['_id']
    assert _items[0]['planning_items'][0]['guid'] == data['_items'][0]['planning_items'][0]['guid']
    assert _items[1]['planning_items'][0]['guid'] == data['_items'][1]['planning_items'][0]['guid']
    assert '_aggregations' in data
    assert data['_items'][0]['_display_from'].replace('+0000', '+00:00') == \
        local_to_utc('Australia/Sydney', date.replace(hour=0, minute=0, second=0)).isoformat()
    assert data['_items'][0]['_display_to'].replace('+0000', '+00:00') == \
        local_to_utc('Australia/Sydney', date.replace(hour=23, minute=59, second=59)).isoformat()

    # post first 3 items in reverse order
    featured['items'] = [item['planning_items'][0]['guid'] for item in _items[:3]]
    featured['items'].reverse()
    resp = post_json(client, 'push', featured)
    assert 200 == resp.status_code

    data = get_json(client, '/agenda/search?navigation=51')
    assert 3 == data['_meta']['total']
    assert _items[2]['_id'] == data['_items'][0]['_id']
    assert _items[1]['_id'] == data['_items'][1]['_id']
    assert _items[0]['_id'] == data['_items'][2]['_id']
    assert _items[2]['planning_items'][0]['guid'] == data['_items'][0]['planning_items'][0]['guid']
    assert _items[1]['planning_items'][0]['guid'] == data['_items'][1]['planning_items'][0]['guid']
    assert _items[0]['planning_items'][0]['guid'] == data['_items'][2]['planning_items'][0]['guid']

    # multiple planing items for event
    app.data.update(
        'agenda',
        _items[0].get('_id'),
        {
            'planning_items': [
                {'_id': 'urn:plan:0', 'guid': 'urn:plan:0'},
                {'_id': 'urn:plan:x', 'guid': 'urn:plan:x'}
            ]
        },
        _items[0]
    )
    featured['items'] = ['urn:plan:2', 'urn:plan:x', 'urn:plan:1', 'urn:plan:0']
    resp = post_json(client, 'push', featured)
    assert 200 == resp.status_code

    data = get_json(client, '/agenda/search?navigation=51')
    assert 3 == data['_meta']['total']
    assert data['_items'][0]['_id'] == _items[2]['_id']
    assert data['_items'][1]['_id'] == _items[0]['_id']
    assert data['_items'][2]['_id'] == _items[1]['_id']

    data = get_json(client, '/agenda/search?navigation=51&q=slugline:nonsense')
    assert 0 == data['_meta']['total']

    # search with no nav - featured disabled
    data = get_json(client, '/agenda/search')
    assert len(_items) <= data['_meta']['total']

    app.data.insert('section_filters', [{
        '_id': 12,
        'name': 'filter test',
        'query': 'NOT slugline:slugline',
        'is_enabled': True,
        'filter_type': 'agenda'
    }])

    data = get_json(client, '/agenda/search?navigation=51')
    assert 0 == data['_meta']['total']

    data = get_json(client, '/agenda/search')
    assert 0 <= data['_meta']['total']


def test_local_time(client, app, mocker):
    # 9 am Sydney Time - day light saving on
    format = '%Y-%m-%dT%H:%M:%S'
    test_utcnow = datetime.strptime('2018-11-23T22:00:00', format)
    with mocker.patch('newsroom.wire.utils.get_utcnow', return_value=test_utcnow):
        local_date = get_local_date('now/d', '00:00:00', -660)
        assert '2018-11-23T13:00:00' == local_date.strftime(format)

        local_date = get_local_date('now/w', '00:00:00', -660)
        assert '2018-11-18T13:00:00' == local_date.strftime(format)

        local_date = get_local_date('now/M', '00:00:00', -660)
        assert '2018-10-31T13:00:00' == local_date.strftime(format)

        local_date = get_local_date('2018-11-24', '00:00:00', -660)
        assert '2018-11-23T13:00:00' == local_date.strftime(format)

        end_local_date = get_local_date('2018-11-24', '23:59:59', -660)
        assert '2018-11-24T12:59:59' == end_local_date.strftime(format)

        end_date = get_end_date('now/d', end_local_date)
        assert '2018-11-24T12:59:59' == end_date.strftime(format)

        end_date = get_end_date('now/w', end_local_date)
        assert '2018-11-30T12:59:59' == end_date.strftime(format)

        end_date = get_end_date('now/M', end_local_date)
        assert '2018-12-23T12:59:59' == end_date.strftime(format)


def test_get_location_string():
    agenda = {}
    assert get_location_string(agenda) == ''

    agenda['location'] = []
    assert get_location_string(agenda) == ''

    agenda['location'] = [{
        'name': 'test location',
        'address': {'locality': 'inner city'}
    }]
    assert get_location_string(agenda) == 'test location, inner city'

    agenda['location'] = [{
        "name": "Sydney Opera House",
        "address": {
            "country": "Australia",
            "type": "arts_centre",
            "postal_code": "2000",
            "title": "Opera v Sydney",
            "line": [
                "2 Macquarie Street"
            ],
            "locality": "Sydney",
            "area": "Sydney"
        }
    }]
    assert get_location_string(agenda) == 'Sydney Opera House, 2 Macquarie Street, Sydney, Sydney, 2000, Australia'


def test_get_public_contacts():
    agenda = {}
    assert get_public_contacts(agenda) == []

    agenda['event'] = {}
    assert get_public_contacts(agenda) == []

    agenda['event']['event_contact_info'] = [
        {
            '_created': '2018-05-16T11:24:20+0000',
            'honorific': 'Professor',
            '_id': '5afc14e41d41c89668850f67',
            'first_name': 'Tom',
            'is_active': True,
            'organisation': 'AAP',
            'contact_email': [
                'jones@foo.com'
            ],
            '_updated': '2018-05-16T11:24:20+0000',
            'mobile': [],
            'contact_phone': [],
            'last_name': 'Jones',
            'public': True
        }
    ]
    assert get_public_contacts(agenda) == [{
        'name': 'Tom Jones',
        'organisation': 'AAP',
        'phone': '',
        'email': 'jones@foo.com',
        'mobile': ''
    }]


def test_get_agenda_dates():
    agenda = {
        'dates': {
            'end':  datetime.strptime('2018-05-28T06:00:00+0000', '%Y-%m-%dT%H:%M:%S+0000').replace(tzinfo=pytz.UTC),
            'start': datetime.strptime('2018-05-28T05:00:00+0000', '%Y-%m-%dT%H:%M:%S+0000').replace(tzinfo=pytz.UTC),
        },
    }
    assert get_agenda_dates(agenda) == '07:00 - 08:00, 28/05/2018'

    agenda = {
        'dates': {
            'end': datetime.strptime('2018-05-30T06:00:00+0000', '%Y-%m-%dT%H:%M:%S+0000').replace(tzinfo=pytz.UTC),
            'start': datetime.strptime('2018-05-28T05:00:00+0000', '%Y-%m-%dT%H:%M:%S+0000').replace(tzinfo=pytz.UTC),
        },
    }
    assert get_agenda_dates(agenda) == '07:00 28/05/2018 - 08:00 30/05/2018'

    agenda = {
        'dates': {
            'end': datetime.strptime('2018-05-28T21:59:00+0000', '%Y-%m-%dT%H:%M:%S+0000').replace(tzinfo=pytz.UTC),
            'start': datetime.strptime('2018-05-27T22:00:00+0000', '%Y-%m-%dT%H:%M:%S+0000').replace(tzinfo=pytz.UTC),
        },
    }
    assert get_agenda_dates(agenda) == 'ALL DAY 28/05/2018'

    agenda = {
        'dates': {
            'end': datetime.strptime('2018-05-30T06:00:00+0000', '%Y-%m-%dT%H:%M:%S+0000').replace(tzinfo=pytz.UTC),
            'start': datetime.strptime('2018-05-30T06:00:00+0000', '%Y-%m-%dT%H:%M:%S+0000').replace(tzinfo=pytz.UTC),
        },
    }
    assert get_agenda_dates(agenda) == '08:00 30/05/2018'
