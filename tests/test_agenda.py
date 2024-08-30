import pytz
from flask import json, session
from datetime import datetime
from urllib import parse
from unittest import mock

import newsroom.auth  # noqa - Fix cyclic import when running single test file
from newsroom.utils import get_location_string, get_agenda_dates, get_public_contacts, get_entity_or_404, \
    get_local_date, get_end_date
from newsroom.agenda.views import related_wire_items
from .fixtures import items, init_items, agenda_items, init_agenda_items, init_auth, init_company, PUBLIC_USER_ID  # noqa
from .utils import post_json, delete_json, get_json, get_admin_user_id, mock_send_email
from copy import deepcopy
from bson import ObjectId
from pytest import fixture

date_time_format = '%Y-%m-%dT%H:%M:%S'

test_planning = {
    "description_text": "description here",
    "abstract": "abstract text",
    "_current_version": 1,
    "agendas": [],
    "anpa_category": [
        {
            "name": "Entertainment",
            "subject": "01000000",
            "qcode": "e"
        }
    ],
    "item_id": "foo",
    "ednote": "ed note here",
    "slugline": "Vivid planning item",
    "headline": "Planning headline",
    "planning_date": "2018-05-28T10:51:52+0000",
    "state": "scheduled",
    "item_class": "plinat:newscoverage",
    "coverages": [
        {
            "planning": {
                "g2_content_type": "text",
                "slugline": "Vivid planning item",
                "internal_note": "internal note here",
                "genre": [
                    {
                        "name": "Article (news)",
                        "qcode": "Article"
                    }
                ],
                "ednote": "ed note here",
                "scheduled": "2018-05-28T10:51:52+0000"
            },
            "news_coverage_status": {
                "name": "coverage intended",
                "label": "Planned",
                "qcode": "ncostat:int"
            },
            "workflow_status": "draft",
            "firstcreated": "2018-05-28T10:55:00+0000",
            "coverage_id": "213"
        }
    ],
    "_id": "foo",
    "urgency": 3,
    "guid": "foo",
    "name": "This is the name of the vivid planning item",
    "subject": [
        {
            "name": "library and museum",
            "qcode": "01009000",
            "parent": "01000000"
        }
    ],
    "pubstatus": "usable",
    "type": "planning",
}


def mock_utcnow():
    return datetime.strptime('2018-11-23T22:00:00', date_time_format)


@fixture
def test_item_detail(client):
    resp = client.get('/agenda/urn:conference')
    assert resp.status_code == 200
    assert 'urn:conference' in resp.get_data().decode()
    assert 'Conference Planning' in resp.get_data().decode()


@fixture
def test_item_json(client):
    resp = client.get('/agenda/urn:conference?format=json')
    data = json.loads(resp.get_data())
    assert 'headline' in data
    assert 'files' in data['event']
    assert 'internal_note' in data['event']
    assert 'internal_note' in data['planning_items'][0]
    assert 'internal_note' in data['coverages'][0]['planning']


@fixture
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


@fixture
def get_bookmarks_count(client, user):
    resp = client.get('/agenda/search?bookmarks=%s' % str(user))
    assert resp.status_code == 200
    data = json.loads(resp.get_data())
    return data['_meta']['total']


@fixture
def test_bookmarks(client, app):
    user_id = get_admin_user_id(app)
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


@fixture
def test_item_copy(client, app):
    resp = client.post('/wire/{}/copy?type=agenda'.format('urn:conference'), content_type='application/json')
    assert resp.status_code == 200

    resp = client.get('/agenda/urn:conference?format=json')
    data = json.loads(resp.get_data())
    assert 'copies' in data

    user_id = get_admin_user_id(app)
    assert str(user_id) in data['copies']


@fixture
@mock.patch('newsroom.wire.views.send_email', mock_send_email)
def test_share_items(client, app, mocker):
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
        assert outbox[0].subject == 'From AAP Newsroom: Conference Planning'
        assert 'Hi Foo Bar' in outbox[0].body
        assert 'admin admin (admin@sourcefabric.org) shared ' in outbox[0].body
        assert 'Conference Planning' in outbox[0].body
        assert 'http://localhost:5050/agenda?item=urn%3Aconference' in outbox[0].body
        assert 'Some info message' in outbox[0].body

    resp = client.get('/agenda/{}?format=json'.format('urn:conference'))
    data = json.loads(resp.get_data())
    assert 'shares' in data

    user_id = get_admin_user_id(app)
    assert str(user_id) in data['shares']


@fixture
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
    assert 'internal_note' not in data['_items'][0]['planning_items'][0]['coverages'][0]['planning']
    assert 'internal_note' not in data['_items'][0]['coverages'][0]['planning']
    resp = client.get('/agenda/search?navigation=51')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])
    assert '_aggregations' in data


@fixture
@mock.patch('newsroom.agenda.email.send_email', mock_send_email)
def test_coverage_request(client, app):
    post_json(client, '/settings/general_settings', {'coverage_request_recipients': 'admin@bar.com'})
    with app.mail.record_messages() as outbox:
        resp = client.post('/agenda/request_coverage', data=json.dumps({
            'item': ['urn:conference'],
            'message': 'Some info message',
        }), content_type='application/json')

        assert resp.status_code == 201, resp.get_data().decode('utf-8')
        assert len(outbox) == 1
        assert outbox[0].recipients == ['admin@bar.com']
        assert outbox[0].subject == 'Coverage inquiry: Conference Planning'
        assert 'admin admin' in outbox[0].body
        assert 'admin@sourcefabric.org' in outbox[0].body
        assert 'http://localhost:5050/agenda?item={}'.format(parse.quote('urn:conference')) in outbox[0].body
        assert 'Some info message' in outbox[0].body


@fixture
def test_watch_event(client, app):
    user_id = get_admin_user_id(app)
    assert 0 == get_bookmarks_count(client, user_id)

    post_json(client, '/agenda_watch', {'items': ['urn:conference']})
    assert 1 == get_bookmarks_count(client, user_id)

    delete_json(client, '/agenda_watch', {'items': ['urn:conference']})
    assert 0 == get_bookmarks_count(client, user_id)


@fixture
def test_watch_coverages(client, app):
    user_id = get_admin_user_id(app)

    post_json(client, '/agenda_coverage_watch', {
        'coverage_id': 'urn:coverage',
        'item_id': 'urn:conference',
    })

    after_watch_item = get_entity_or_404('urn:conference', 'agenda')
    assert after_watch_item['coverages'][0]['watches'] == [user_id]


@fixture
def test_unwatch_coverages(client, app):
    user_id = get_admin_user_id(app)

    post_json(client, '/agenda_coverage_watch', {
        'coverage_id': 'urn:coverage',
        'item_id': 'urn:conference',
    })

    after_watch_item = get_entity_or_404('urn:conference', 'agenda')
    assert after_watch_item['coverages'][0]['watches'] == [user_id]

    delete_json(client, '/agenda_coverage_watch', {
        'coverage_id': 'urn:coverage',
        'item_id': 'urn:conference',
    })

    after_watch_item = get_entity_or_404('urn:conference', 'agenda')
    assert after_watch_item['coverages'][0]['watches'] == []


@fixture
def test_remove_watch_coverages_on_watch_item(client, app):
    user_id = ObjectId(get_admin_user_id(app))
    other_user_id = PUBLIC_USER_ID

    test_planning_coverage_watches = deepcopy(test_planning)
    test_planning_coverage_watches['coverages'][0]['watches'] = [other_user_id]
    client.post('/push', data=json.dumps(test_planning_coverage_watches), content_type='application/json')

    post_json(client, '/agenda_coverage_watch', {
        'coverage_id': test_planning_coverage_watches['coverages'][0]['coverage_id'],
        'item_id': test_planning_coverage_watches['_id'],
    })

    after_watch_coverage_item = get_entity_or_404(test_planning_coverage_watches['_id'], 'agenda')
    assert str(other_user_id) in after_watch_coverage_item['coverages'][0]['watches']
    assert user_id in after_watch_coverage_item['coverages'][0]['watches']

    post_json(client, '/agenda_watch', {'items': [test_planning_coverage_watches['_id']]})
    after_watch_item = get_entity_or_404(test_planning_coverage_watches['_id'], 'agenda')
    assert after_watch_item['coverages'][0]['watches'] == [str(other_user_id)]
    assert after_watch_item['watches'] == [user_id]


@fixture
def test_fail_watch_coverages(client, app):
    user_id = get_admin_user_id(app)

    post_json(client, '/agenda_watch', {'items': ['urn:conference']})
    after_watch_item = get_entity_or_404('urn:conference', 'agenda')
    assert after_watch_item['watches'] == [user_id]

    with client.session_transaction() as session:
        session['user'] = str(PUBLIC_USER_ID)
        session['user_type'] = 'public'
        request = {
            'coverage_id': 'urn:coverage',
            'item_id': 'urn:conference',
        }

        # Add a coverage watch
        resp = client.post('/agenda_coverage_watch', data=json.dumps(request, indent=2),
                           content_type='application/json')
        assert resp.status_code == 403

        # Remove a coverage watch
        resp = client.delete('/agenda_coverage_watch', data=json.dumps(request, indent=2),
                             content_type='application/json')
        assert resp.status_code == 403


@fixture
@mock.patch('newsroom.utils.get_utcnow', mock_utcnow)
def test_local_time(client, app, mocker):
    # 9 am Sydney Time - day light saving on
    local_date = get_local_date('now/d', '00:00:00', -660)
    assert '2018-11-23T13:00:00' == local_date.strftime(date_time_format)

    local_date = get_local_date('now/w', '00:00:00', -660)
    assert '2018-11-18T13:00:00' == local_date.strftime(date_time_format)

    local_date = get_local_date('now/M', '00:00:00', -660)
    assert '2018-10-31T13:00:00' == local_date.strftime(date_time_format)

    local_date = get_local_date('2018-11-24', '00:00:00', -660)
    assert '2018-11-23T13:00:00' == local_date.strftime(date_time_format)

    end_local_date = get_local_date('2018-11-24', '23:59:59', -660)
    assert '2018-11-24T12:59:59' == end_local_date.strftime(date_time_format)

    end_date = get_end_date('now/d', end_local_date)
    assert '2018-11-24T12:59:59' == end_date.strftime(date_time_format)

    end_date = get_end_date('now/w', end_local_date)
    assert '2018-11-30T12:59:59' == end_date.strftime(date_time_format)

    end_date = get_end_date('now/M', end_local_date)
    assert '2018-12-23T12:59:59' == end_date.strftime(date_time_format)


@fixture
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


@fixture
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


@fixture
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


@fixture
def test_filter_agenda_by_coverage_status(client):
    client.post('/push', data=json.dumps(test_planning), content_type='application/json')

    test_planning['guid'] = 'bar'
    test_planning['coverages'][0]['news_coverage_status'] = {
        "name": "coverage not intended",
        "label": "Not Planned",
        "qcode": "ncostat:fint"
    }
    client.post('/push', data=json.dumps(test_planning), content_type='application/json')

    test_planning['guid'] = 'baz'
    test_planning['planning_date'] = '2018-05-28T10:45:52+0000',
    test_planning['coverages'] = []
    client.post('/push', data=json.dumps(test_planning), content_type='application/json')

    data = get_json(client, '/agenda/search?filter={"coverage_status":["planned"]}')
    assert 1 == data['_meta']['total']
    assert 'foo' == data['_items'][0]['_id']

    data = get_json(client, '/agenda/search?filter={"coverage_status":["not planned"]}')
    assert 3 == data['_meta']['total']
    assert 'baz' == data['_items'][0]['_id']
    assert 'bar' == data['_items'][1]['_id']
    assert 'urn:conference' == data['_items'][2]['_id']


@fixture
def test_filter_events_only(client):
    test_planning = {
        "description_text": "description here",
        "abstract": "abstract text",
        "_current_version": 1,
        "agendas": [],
        "anpa_category": [
            {
                "name": "Entertainment",
                "subject": "01000000",
                "qcode": "e"
            }
        ],
        "item_id": "foo",
        "ednote": "ed note here",
        "slugline": "Vivid planning item",
        "headline": "Planning headline",
        "planning_date": "2018-05-28T10:51:52+0000",
        "state": "scheduled",
        "item_class": "plinat:newscoverage",
        "coverages": [
            {
                "planning": {
                    "g2_content_type": "text",
                    "slugline": "Vivid planning item",
                    "internal_note": "internal note here",
                    "genre": [
                        {
                            "name": "Article (news)",
                            "qcode": "Article"
                        }
                    ],
                    "ednote": "ed note here",
                    "scheduled": "2018-05-28T10:51:52+0000"
                },
                "news_coverage_status": {
                    "name": "coverage intended",
                    "label": "Planned",
                    "qcode": "ncostat:int"
                },
                "workflow_status": "draft",
                "firstcreated": "2018-05-28T10:55:00+0000",
                "coverage_id": "213"
            }
        ],
        "_id": "foo",
        "urgency": 3,
        "guid": "foo",
        "name": "This is the name of the vivid planning item",
        "subject": [
            {
                "name": "library and museum",
                "qcode": "01009000",
                "parent": "01000000"
            }
        ],
        "pubstatus": "usable",
        "type": "planning",
    }

    client.post('/push', data=json.dumps(test_planning), content_type='application/json')
    data = get_json(client, '/agenda/search')
    assert 2 == data['_meta']['total']
    assert 'urn:conference' == data['_items'][1]['_id']
    assert 'foo' == data['_items'][0]['_id']
    assert 1 == len(data['_items'][1]['planning_items'])
    assert 1 == len(data['_items'][1]['coverages'])
    data = get_json(client, '/agenda/search?eventsOnlyView=true')

    assert 1 == data['_meta']['total']
    assert 'urn:conference' == data['_items'][0]['_id']
    assert 'planning_items' not in data['_items'][0]
    assert 'coverages' not in data['_items'][0]


@fixture
def test_related_wire_items(client, app):
    test_planning_with_coveragre = deepcopy(test_planning)
    test_planning_with_coveragre["coverages"] = [
        {
            "coverage_id": "d01ce39aed17",
            "delivery_id": "812f8bb5a5d7",
            "coverage_type": "text"
        },
        {
            "coverage_id": "250363d911b0",
            "delivery_id": "05e339456ea0",
            "coverage_type": "text"
        },
        {
            "coverage_id": "7a53221bca0a",
            "planning_id": "a1f6f076f7b4",
            "coverage_type": "picture"
        },
        {
            "coverage_id": "954757c9881c",
            "delivery_id": "97d3b5cd0861",
            "coverage_type": "text"
        }
    ]

    coverage_items = [{"_id": "812f8bb5a5d7", 'service': [{'code': 'a', 'name': 'Service A'}]},
                      {"_id": "05e339456ea0", 'service': [{'code': 'b', 'name': 'Service B'}]},
                      {"_id": "97d3b5cd0861", 'service': [{'code': 'a', 'name': 'Service A'}]}]
    app.data.insert('agenda', [test_planning_with_coveragre])
    app.data.insert('items', coverage_items)
    app.data.insert('products', [{
        '_id': ObjectId('5e65964bf5db68883df561d0'), 'name': 'Sport1', 'description': 'sport product 1',
        'is_enabled': True, 'product_type': 'wire',
        'navigations': [],
        'companies': ['1'],
        'query': 'service.code:a'
    }])
    with app.test_request_context():
        session['user'] = PUBLIC_USER_ID
        session['name'] = 'Test'
        resp = related_wire_items("05e339456ea0")
        data = json.loads(resp[0].get_data())
        assert data.get('agenda_item').get('_id') == 'foo'
        assert (next(item for item in data.get('wire_items') if item["_id"] == "05e339456ea0").get("_access")) is False
