import io
import pytz
from flask import json
from .test_push import get_signature_headers
from .utils import post_json, get_json, mock_send_email
from datetime import datetime
from copy import deepcopy

from superdesk import get_resource_service
import newsroom.auth  # noqa - Fix cyclic import when running single test file
from newsroom.utils import get_entity_or_404
from newsroom.notifications import get_user_notifications
from .fixtures import init_auth  # noqa
from unittest import mock
from pytest import fixture

test_event = {
    'state': 'scheduled',
    'slugline': 'New Press conference',
    'calendars': [
        {
            'name': 'Sport',
            'qcode': 'sport',
            'is_active': True
        }
    ],
    'ednote': 'This is ed note field',
    'anpa_category': [
        {
            'name': 'Australian General News',
            'qcode': 'a'
        }
    ],
    'dates': {
        'end': '2018-05-28T05:00:00+0000',
        'start': '2018-05-28T04:00:00+0000',
        'tz': 'Australia/Sydney'
    },
    'guid': 'foo',
    'event_id': 'foo',
    'type': 'event',
    'location': [
        {
            'location': {
                'lat': -33.8548157,
                'lon': 151.2164539
            },
            'qcode': 'urn:newsml:localhost:5000:2018-05-16T21:26:16.147890:d7268d73-1939-4c32-94dd-4f04f5488cd0',
            'formatted_address': 'Sydney Australia',
            'address': {
                'line': [
                    ''
                ],
                'title': None,
                'locality': 'Sydney',
                'country': 'Australia'
            },
            'name': 'Sydney'
        }
    ],
    'event_contact_info': [
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
    ],
    'definition_short': 'Prime minister will talk to press',
    'name': 'Prime minister press conference',
    'links': [
        'www.earthhour.com'
    ],
    '_current_version': 1,
    'subject': [
        {
            'name': 'ecosystem',
            'qcode': '06002002',
            'parent': '06002000'
        }
    ],
    'definition_long': 'Ministers will check the environmental issues',
    'occur_status': {
        'name': 'Planned, occurs certainly',
        'qcode': 'eocstat:eos5',
        'label': 'Planned, occurs certainly'
    }
}

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
    "item_id": "bar",
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
                "slugline": "Vivid Text Explainer",
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
            "coverage_status": {
                "name": "coverage intended",
                "label": "Planned",
                "qcode": "ncostat:int"
            },
            "workflow_status": "draft",
            "firstcreated": "2018-05-28T10:55:00+0000",
            "coverage_id": "urn:newsml:localhost:5000:2018-05-28T20:55:00.496765:197d3430-9cd1-4b93-822f-c3c050b5b6ab"
        },
        {
            "planning": {
                "g2_content_type": "picture",
                "slugline": "Vivid Photos",
                "internal_note": "internal note here",
                "ednote": "ed note here",
                "scheduled": "2018-05-28T10:51:52+0000"
            },
            "coverage_status": {
                "name": "coverage intended",
                "label": "Planned",
                "qcode": "ncostat:int"
            },
            "workflow_status": "draft",
            "firstcreated": "2018-05-28T10:55:00+0000",
            "coverage_id": "urn:newsml:localhost:5000:2018-05-28T20:55:00.526019:88f5bc77-f0ce-4775-acc1-e728f10f79f7"
        }
    ],
    "_id": "bar",
    "urgency": 3,
    "guid": "bar",
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
    "event_item": "foo",
}

text_item = {'byline': 'A Smith', 'copyrightholder': 'Australian Associated Press', 'pubstatus': 'usable',
             'readtime': 0, 'description_text': 'Abstract', 'profile': 'ContentProfile',
             'guid': 'urn:newsml:localhost:2020-08-06T15:59:39.183090:1f02e9bb-3007-48f3-bfad-ffa6107f87bd',
             'type': 'text',
             'place': [{'code': 'CIS', 'name': 'Commonwealth of Independent States'}],
             'description_html': '<p>Abstract</p>',
             'wordcount': 1, 'slugline': 'something', 'firstpublished': '2020-08-06T06:00:59+0000', 'language': 'en',
             'priority': 6,
             'version': '2', 'body_html': '<p>Body</p>', 'charcount': 4, 'versioncreated': '2020-08-06T06:00:24+0000',
             'genre': [{'code': 'Backgrounder', 'name': 'Backgrounder'}], 'firstcreated': '2020-08-06T05:59:39+0000',
             'service': [{'code': 'i', 'name': 'International News'}],
             'headline': 'Headline', 'source': 'AAP',
             'subject': [{'code': '01000000', 'name': 'arts, culture and entertainment'}], 'located': 'Wagga Wagga',
             'urgency': 3}


@fixture
def test_push_parsed_event(client, app):
    event = deepcopy(test_event)
    client.post('/push', data=json.dumps(event), content_type='application/json')
    parsed = get_entity_or_404(event['guid'], 'agenda')
    assert isinstance(parsed['firstcreated'], datetime)
    assert parsed['dates']['tz'] == 'Australia/Sydney'
    assert parsed['dates']['end'] == datetime.\
        strptime('2018-05-28T05:00:00+0000', '%Y-%m-%dT%H:%M:%S+0000').replace(tzinfo=pytz.UTC)
    assert 1 == len(parsed['event']['event_contact_info'])
    assert 1 == len(parsed['location'])
    assert 1 == len(parsed['service'])
    assert 1 == len(parsed['subject'])
    assert 'a' == parsed['service'][0]['code']

    resp = client.get('/agenda/search?date_to=now/d')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])


@fixture
def test_push_cancelled_event(client, app):
    event = deepcopy(test_event)
    event['guid'] = 'foo2'
    event['version'] = 1

    # first push
    client.post('/push', data=json.dumps(event), content_type='application/json')

    # update comes in
    event['pubstatus'] = 'cancelled'
    event['state'] = 'cancelled'
    event.pop('version', None)

    resp = client.post('/push', data=json.dumps(event), content_type='application/json')
    assert resp.status_code == 200
    parsed = get_entity_or_404(event['guid'], 'agenda')
    assert isinstance(parsed['firstcreated'], datetime)
    assert 1 == len(parsed['event']['event_contact_info'])
    assert 1 == len(parsed['location'])
    assert parsed['event']['pubstatus'] == 'cancelled'


@fixture
def test_push_updated_event(client, app):
    event = deepcopy(test_event)
    event['guid'] = 'foo3'
    # first push
    client.post('/push', data=json.dumps(event), content_type='application/json')

    # update comes in
    event['state'] = 'rescheduled'
    event['dates'] = {
        'start': '2018-05-27T08:00:00+0000',
        'end': '2018-06-30T09:00:00+0000',
        'tz': 'Australia/Sydney'
    }
    client.post('/push', data=json.dumps(event), content_type='application/json')
    parsed = get_entity_or_404(event['guid'], 'agenda')
    assert isinstance(parsed['firstcreated'], datetime)
    assert 1 == len(parsed['event']['event_contact_info'])
    assert 1 == len(parsed['location'])
    assert parsed['dates']['end'].day == 30


@fixture
def test_push_parsed_planning_for_an_existing_event(client, app):
    event = deepcopy(test_event)
    event['guid'] = 'foo4'
    client.post('/push', data=json.dumps(event), content_type='application/json')
    parsed = get_entity_or_404(event['guid'], 'agenda')
    assert isinstance(parsed['firstcreated'], datetime)
    assert 1 == len(parsed['event']['event_contact_info'])
    assert 1 == len(parsed['location'])

    planning = deepcopy(test_planning)
    planning['guid'] = 'bar1'
    planning['event_item'] = 'foo4'
    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo4', 'agenda')
    assert parsed['name'] == test_event['name']
    assert parsed['definition_short'] == test_event['definition_short']
    assert parsed['slugline'] == test_event['slugline']
    assert parsed['definition_long'] == test_event['definition_long']
    assert parsed['dates']['start'].isoformat() == test_event['dates']['start'].replace('0000', '00:00')
    assert parsed['dates']['end'].isoformat() == test_event['dates']['end'].replace('0000', '00:00')
    assert parsed['ednote'] == event['ednote']

    assert 2 == len(parsed['coverages'])
    assert 1 == len(parsed['service'])
    assert 'a' == parsed['service'][0]['code']
    assert 1 == len(parsed['subject'])
    assert '06002002' == parsed['subject'][0]['code']
    assert parsed['coverages'][0]['slugline'] == 'Vivid Text Explainer'
    assert parsed['coverages'][1]['slugline'] == 'Vivid Photos'

    parsed_planning = parsed['planning_items'][0]
    assert 1 == len(parsed_planning['service'])
    assert 'e' == parsed_planning['service'][0]['code']
    assert 1 == len(parsed_planning['subject'])
    assert '01009000' == parsed_planning['subject'][0]['code']
    assert parsed_planning['description_text'] == planning['description_text']
    assert parsed_planning['slugline'] == planning['slugline']
    assert parsed_planning['headline'] == planning['headline']
    assert parsed_planning['ednote'] == planning['ednote']
    assert 2 == len(parsed_planning['coverages'])


@fixture
def test_push_coverages_with_different_dates_for_an_existing_event(client, app):
    event = deepcopy(test_event)
    event['guid'] = 'foo4'
    client.post('/push', data=json.dumps(event), content_type='application/json')
    parsed = get_entity_or_404(event['guid'], 'agenda')
    assert isinstance(parsed['firstcreated'], datetime)
    assert 1 == len(parsed['event']['event_contact_info'])
    assert 1 == len(parsed['location'])

    planning = deepcopy(test_planning)
    planning['guid'] = 'bar1'
    planning['event_item'] = 'foo4'
    planning['coverages'][0]['planning']['scheduled'] = "2018-06-28T10:51:52+0000"
    planning['coverages'][1]['planning']['scheduled'] = "2018-06-28T13:51:52+0000"

    # planning['planning_date'] = "2018-05-28T10:51:52+0000"
    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo4', 'agenda')
    assert parsed['name'] == test_event['name']
    assert parsed['definition_short'] == test_event['definition_short']
    assert parsed['slugline'] == test_event['slugline']

    parsed_planning = parsed['planning_items'][0]
    assert parsed_planning['description_text'] == planning['description_text']

    assert 2 == len(parsed['coverages'])
    assert parsed['dates']['start'].isoformat() == event['dates']['start'].replace('0000', '00:00')
    assert parsed['dates']['end'].isoformat() == event['dates']['end'].replace('0000', '00:00')
    assert 2 == len(parsed['display_dates'])
    assert parsed['display_dates'][0]['date'].isoformat() == \
        planning['coverages'][0]['planning']['scheduled'].replace('0000', '00:00')
    assert parsed['display_dates'][1]['date'].isoformat() == \
        planning['coverages'][1]['planning']['scheduled'].replace('0000', '00:00')


@fixture
def test_push_planning_with_different_dates_for_an_existing_event(client, app):
    event = deepcopy(test_event)
    event['guid'] = 'foo4'
    client.post('/push', data=json.dumps(event), content_type='application/json')
    parsed = get_entity_or_404(event['guid'], 'agenda')
    assert isinstance(parsed['firstcreated'], datetime)
    assert 1 == len(parsed['event']['event_contact_info'])
    assert 1 == len(parsed['location'])

    planning = deepcopy(test_planning)
    planning['guid'] = 'bar1'
    planning['event_item'] = 'foo4'
    # remove coverages so planning date gets into account
    planning.pop('coverages', None)

    planning['planning_date'] = "2018-07-28T10:51:52+0000"
    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo4', 'agenda')
    assert parsed['name'] == test_event['name']
    assert parsed['definition_short'] == test_event['definition_short']
    assert parsed['slugline'] == test_event['slugline']
    assert parsed['dates']['start'].isoformat() == event['dates']['start'].replace('0000', '00:00')
    assert parsed['dates']['end'].isoformat() == event['dates']['end'].replace('0000', '00:00')
    assert 1 == len(parsed['display_dates'])
    assert parsed['display_dates'][0]['date'].isoformat() == planning['planning_date'].replace('0000', '00:00')

    parsed_planning = parsed['planning_items'][0]
    assert parsed_planning['description_text'] == planning['description_text']
    assert parsed_planning['slugline'] == planning['slugline']


@fixture
def test_push_cancelled_planning_for_an_existing_event(client, app):
    event = deepcopy(test_event)
    event['guid'] = 'foo5'
    client.post('/push', data=json.dumps(event), content_type='application/json')
    parsed = get_entity_or_404(event['guid'], 'agenda')
    assert isinstance(parsed['firstcreated'], datetime)
    assert 1 == len(parsed['event']['event_contact_info'])
    assert 1 == len(parsed['location'])

    # first push
    planning = deepcopy(test_planning)
    planning['guid'] = 'bar2'
    planning['event_item'] = 'foo5'
    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo5', 'agenda')
    assert len(parsed['coverages']) == 2
    assert len(parsed['planning_items']) == 1

    # update the planning for cancel
    planning['pubstatus'] = 'cancelled'
    planning['state'] = 'cancelled'

    # second push
    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo5', 'agenda')
    assert len(parsed['coverages']) == 0
    assert len(parsed['planning_items']) == 0


@fixture
def test_push_parsed_adhoc_planning_for_an_non_existing_event(client, app):
    # pushing an event to create the index
    event = deepcopy(test_event)
    event['guid'] = 'foo6'
    client.post('/push', data=json.dumps(event), content_type='application/json')

    # remove event link from planning item
    planning = deepcopy(test_planning)
    planning['guid'] = 'bar3'
    planning['event_item'] = None

    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('bar3', 'agenda')
    assert isinstance(parsed['firstcreated'], datetime)
    assert 2 == len(parsed['coverages'])
    assert 1 == len(parsed['planning_items'])
    assert parsed['headline'] == 'Planning headline'
    assert parsed['definition_short'] == test_planning['description_text']
    assert parsed['definition_long'] == test_planning['abstract']


@fixture
@mock.patch('newsroom.email.send_email', mock_send_email)
def test_notify_topic_matches_for_new_event_item(client, app, mocker):
    event = deepcopy(test_event)
    client.post('/push', data=json.dumps(event), content_type='application/json')

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

        topic = {'label': 'bar', 'query': 'foo', 'notifications': True, 'topic_type': 'agenda'}
        resp = cli.post('api/users/%s/topics' % user, data=topic)
        assert 201 == resp.status_code

    key = b'something random'
    app.config['PUSH_KEY'] = key
    event['dates']['start'] = '2018-05-29T04:00:00+0000'
    data = json.dumps(event)
    push_mock = mocker.patch('newsroom.push.push_notification')
    headers = get_signature_headers(data, key)
    resp = client.post('/push', data=data, content_type='application/json', headers=headers)
    assert 200 == resp.status_code
    assert push_mock.call_args[1]['item']['_id'] == 'foo'
    assert len(push_mock.call_args[1]['topics']) == 1


@fixture
@mock.patch('newsroom.email.send_email', mock_send_email)
def test_notify_topic_matches_for_new_planning_item(client, app, mocker):
    event = deepcopy(test_event)
    client.post('/push', data=json.dumps(event), content_type='application/json')

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

        topic = {'label': 'bar', 'query': 'foo', 'notifications': True, 'topic_type': 'agenda'}
        resp = cli.post('api/users/%s/topics' % user, data=topic)
        assert 201 == resp.status_code

    key = b'something random'
    app.config['PUSH_KEY'] = key

    planning = deepcopy(test_planning)
    planning['guid'] = 'bar2'
    planning['event_item'] = 'foo'
    data = json.dumps(planning)
    push_mock = mocker.patch('newsroom.push.push_notification')
    headers = get_signature_headers(data, key)
    resp = client.post('/push', data=data, content_type='application/json', headers=headers)
    assert 200 == resp.status_code
    assert push_mock.call_args[1]['item']['_id'] == 'foo'
    assert len(push_mock.call_args[1]['topics']) == 1


@fixture
@mock.patch('newsroom.email.send_email', mock_send_email)
def test_notify_topic_matches_for_ad_hoc_planning_item(client, app, mocker):
    # remove event link from planning item
    planning = deepcopy(test_planning)
    planning['guid'] = 'bar3'
    planning['event_item'] = None
    client.post('/push', data=json.dumps(planning), content_type='application/json')

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

        topic = {'label': 'bar', 'query': 'bar3', 'notifications': True, 'topic_type': 'agenda'}
        resp = cli.post('api/users/%s/topics' % user, data=topic)
        assert 201 == resp.status_code

    key = b'something random'
    app.config['PUSH_KEY'] = key

    # resend the planning item
    data = json.dumps(planning)
    push_mock = mocker.patch('newsroom.push.push_notification')
    headers = get_signature_headers(data, key)
    resp = client.post('/push', data=data, content_type='application/json', headers=headers)
    assert 200 == resp.status_code
    assert push_mock.call_args[1]['item']['_id'] == 'bar3'
    assert len(push_mock.call_args[1]['topics']) == 1


@fixture
@mock.patch('newsroom.email.send_email', mock_send_email)
def test_notify_user_matches_for_ad_hoc_agenda_in_history(client, app, mocker):
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
        '_id': 'bar3',
    }], action='download', user=user)

    # remove event link from planning item
    planning = deepcopy(test_planning)
    planning['guid'] = 'bar3'
    planning['event_item'] = None

    key = b'something random'
    app.config['PUSH_KEY'] = key

    data = json.dumps(planning)
    push_mock = mocker.patch('newsroom.push.push_notification')
    headers = get_signature_headers(data, key)
    resp = client.post('/push', data=data, content_type='application/json', headers=headers)
    assert 200 == resp.status_code
    assert push_mock.call_args[1]['item']['_id'] == 'bar3'
    assert len(push_mock.call_args[1]['users']) == 1

    notification = get_resource_service('notifications').find_one(req=None, user=user_ids[0])
    assert notification['item'] == 'bar3'


@fixture
@mock.patch('newsroom.email.send_email', mock_send_email)
def test_notify_user_matches_for_new_agenda_in_history(client, app, mocker):
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
        '_id': 'foo',
    }], action='download', user=user)

    key = b'something random'
    app.config['PUSH_KEY'] = key
    event = deepcopy(test_event)
    data = json.dumps(event)
    push_mock = mocker.patch('newsroom.push.push_notification')
    headers = get_signature_headers(data, key)
    resp = client.post('/push', data=data, content_type='application/json', headers=headers)
    assert 200 == resp.status_code
    assert push_mock.call_args[1]['item']['_id'] == 'foo'
    assert len(push_mock.call_args[1]['users']) == 1

    notification = get_resource_service('notifications').find_one(req=None, user=user_ids[0])
    assert notification['item'] == 'foo'


@fixture
@mock.patch('newsroom.email.send_email', mock_send_email)
def test_notify_user_matches_for_new_planning_in_history(client, app, mocker):
    event = deepcopy(test_event)
    client.post('/push', data=json.dumps(event), content_type='application/json')

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
        '_id': 'foo',
    }], action='download', user=user)

    key = b'something random'
    app.config['PUSH_KEY'] = key

    planning = deepcopy(test_planning)
    planning['guid'] = 'bar2'
    planning['event_item'] = 'foo'
    data = json.dumps(planning)
    push_mock = mocker.patch('newsroom.push.push_notification')
    headers = get_signature_headers(data, key)
    resp = client.post('/push', data=data, content_type='application/json', headers=headers)
    assert 200 == resp.status_code

    assert push_mock.call_args[1]['item']['_id'] == 'foo'
    assert len(push_mock.call_args[1]['users']) == 1

    notification = get_resource_service('notifications').find_one(req=None, user=user_ids[0])
    assert notification['item'] == 'foo'


@fixture
@mock.patch('newsroom.email.send_email', mock_send_email)
def test_notify_user_matches_for_killed_item_in_history(client, app, mocker):
    event = deepcopy(test_event)
    client.post('/push', data=json.dumps(event), content_type='application/json')

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
        '_id': 'foo',
    }], action='download', user=user)

    key = b'something random'
    app.config['PUSH_KEY'] = key
    event['pubstatus'] = 'cancelled'
    event['state'] = 'cancelled'
    data = json.dumps(event)
    push_mock = mocker.patch('newsroom.push.push_notification')
    headers = get_signature_headers(data, key)

    with app.mail.record_messages() as outbox:
        resp = client.post('/push', data=data, content_type='application/json', headers=headers)
        assert 200 == resp.status_code
        assert push_mock.call_args[1]['item']['_id'] == 'foo'
        assert len(push_mock.call_args[1]['users']) == 1
    assert len(outbox) == 1
    notification = get_resource_service('notifications').find_one(req=None, user=user_ids[0])
    assert notification['item'] == 'foo'


@fixture
def test_push_event_with_files(client, app):
    event = deepcopy(test_event)
    media_id = 'media-id'
    resp = client.post('/push_binary', data=dict(
        media_id=media_id,
        media=(io.BytesIO('foo'.encode('utf-8')), media_id, 'text/plain'),
    ))
    assert resp.status_code == 201

    event['files'] = [
        {'media': media_id, 'name': 'test.txt', 'mimetype': 'text/plain'},
    ]

    resp = client.post('/push', data=json.dumps(event), content_type='application/json')
    assert resp.status_code == 200

    resp = client.get('/agenda/foo?format=json')
    item = json.loads(resp.get_data())

    assert 1 == len(item['event']['files'])
    file_ref = item['event']['files'][0]
    assert 'href' in file_ref
    resp = client.get(file_ref['href'])
    assert 200 == resp.status_code
    assert 'foo' == resp.get_data().decode('utf-8')


@fixture
@mock.patch('newsroom.agenda.email.send_email', mock_send_email)
def test_push_story_wont_notify_for_first_publish(client, app, mocker):
    test_item = {
        'type': 'text',
        'guid': 'item',
        'planning_id': test_planning['_id'],
        'coverage_id': test_planning['coverages'][0]['coverage_id'],
    }
    post_json(client, '/push', test_event)
    post_json(client, '/push', test_planning)

    post_json(client, '/agenda_watch', {'items': [test_event['guid']]})

    with app.mail.record_messages() as outbox:
        post_json(client, '/push', test_item)

    item = get_json(client, '/agenda/foo')
    coverages = item.get('coverages')

    assert coverages[0]['coverage_id'] == test_item['coverage_id']
    assert coverages[0]['delivery_id'] == test_item['guid']
    assert coverages[0]['delivery_href'] == '/wire/%s' % test_item['guid']

    wire_item = get_json(client, '/wire/item')
    assert wire_item['_id'] == 'item'

    assert len(outbox) == 0


@fixture
def assign_active_company(app):
    company_ids = app.data.insert('companies', [{
        'name': 'Press co.',
        'is_enabled': True,
    }])

    current_user = app.data.find_all('users')[0]
    app.data.update('users', current_user['_id'], {'company': company_ids[0]}, current_user)
    return current_user['_id']


@fixture
@mock.patch('newsroom.agenda.email.send_email', mock_send_email)
def test_watched_event_sends_notification_for_event_update(client, app, mocker):
    event = deepcopy(test_event)
    post_json(client, '/push', event)
    user_id = assign_active_company(app)
    post_json(client, '/agenda_watch', {'items': [event['guid']]})

    # update comes in
    event['state'] = 'rescheduled'
    event['dates'] = {
        'start': '2018-05-27T08:00:00+0000',
        'end': '2018-06-30T09:00:00+0000',
        'tz': 'Australia/Sydney'
    }

    push_mock = mocker.patch('newsroom.agenda.agenda.push_notification')
    with app.mail.record_messages() as outbox:
        post_json(client, '/push', event)
    notifications = get_user_notifications(user_id)

    assert len(outbox) == 1
    assert 'Subject: Prime minister press conference - updated' in str(outbox[0])
    assert 'The event you have been following has been rescheduled' in str(outbox[0])
    assert push_mock.call_args[0][0] == 'agenda_update'
    assert push_mock.call_args[1]['item']['_id'] == 'foo'
    assert len(push_mock.call_args[1]['users']) == 1
    assert len(notifications) == 1
    assert notifications[0]['_id'] == '{}_foo'.format(user_id)


@fixture
@mock.patch('newsroom.agenda.email.send_email', mock_send_email)
def test_watched_event_sends_notification_for_unpost_event(client, app, mocker):
    event = deepcopy(test_event)
    planning = deepcopy(test_planning)
    post_json(client, '/push', event)
    post_json(client, '/push', planning)
    user_id = assign_active_company(app)
    post_json(client, '/agenda_watch', {'items': [event['guid']]})

    # update the event for unpost
    event['pubstatus'] = 'cancelled'
    event['state'] = 'cancelled'

    push_mock = mocker.patch('newsroom.agenda.agenda.push_notification')
    with app.mail.record_messages() as outbox:
        post_json(client, '/push', event)
    notifications = get_user_notifications(user_id)

    assert len(outbox) == 1
    assert 'Subject: Prime minister press conference - Coverage updated' in str(outbox[0])
    assert 'The event you have been following has been cancelled' in str(outbox[0])
    assert push_mock.call_args[0][0] == 'agenda_update'
    assert push_mock.call_args[1]['item']['_id'] == 'foo'
    assert len(push_mock.call_args[1]['users']) == 1
    assert len(notifications) == 1
    assert notifications[0]['_id'] == '{}_foo'.format(user_id)


@fixture
@mock.patch('newsroom.agenda.email.send_email', mock_send_email)
def test_watched_event_sends_notification_for_added_planning(client, app, mocker):
    event = deepcopy(test_event)
    post_json(client, '/push', event)
    user_id = assign_active_company(app)
    post_json(client, '/agenda_watch', {'items': [event['guid']]})

    # planning comes in
    planning = deepcopy(test_planning)

    push_mock = mocker.patch('newsroom.agenda.agenda.push_notification')
    with app.mail.record_messages() as outbox:
        post_json(client, '/push', planning)
    notifications = get_user_notifications(user_id)

    assert len(outbox) == 1
    assert 'Subject: Prime minister press conference - Coverage updated' in str(outbox[0])
    assert 'The event you have been following has new coverage(s)' in str(outbox[0])
    assert '! Text coverage \'Vivid Text Explainer\' due' in str(outbox[0])
    assert '! Picture coverage \'Vivid Photos\' due' in str(outbox[0])

    assert push_mock.call_args[0][0] == 'agenda_update'
    assert push_mock.call_args[1]['item']['_id'] == 'foo'
    assert len(push_mock.call_args[1]['users']) == 1
    assert len(notifications) == 1
    assert notifications[0]['_id'] == '{}_foo'.format(user_id)


@fixture
@mock.patch('newsroom.agenda.email.send_email', mock_send_email)
def test_watched_event_sends_notification_for_cancelled_planning(client, app, mocker):
    event = deepcopy(test_event)
    planning = deepcopy(test_planning)
    post_json(client, '/push', event)
    post_json(client, '/push', planning)
    user_id = assign_active_company(app)
    post_json(client, '/agenda_watch', {'items': [event['guid']]})

    # update the planning for cancel
    planning['pubstatus'] = 'cancelled'
    planning['state'] = 'cancelled'

    push_mock = mocker.patch('newsroom.agenda.agenda.push_notification')
    with app.mail.record_messages() as outbox:
        post_json(client, '/push', planning)
    notifications = get_user_notifications(user_id)

    assert len(outbox) == 1
    assert 'Subject: Prime minister press conference - Coverage updated' in str(outbox[0])
    assert '! Text coverage \'Vivid Text Explainer\' has been cancelled.\r\nNote: ed note here' in str(outbox[0])
    assert '! Picture coverage \'Vivid Photos\' has been cancelled.\r\nNote: ed note here' in str(outbox[0])
    assert push_mock.call_args[0][0] == 'agenda_update'
    assert push_mock.call_args[1]['item']['_id'] == 'foo'
    assert len(push_mock.call_args[1]['users']) == 1
    assert len(notifications) == 1
    assert notifications[0]['_id'] == '{}_foo'.format(user_id)


@fixture
@mock.patch('newsroom.agenda.email.send_email', mock_send_email)
def test_watched_event_sends_notification_for_added_coverage(client, app, mocker):
    event = deepcopy(test_event)
    planning = deepcopy(test_planning)
    post_json(client, '/push', event)
    post_json(client, '/push', planning)
    user_id = assign_active_company(app)
    post_json(client, '/agenda_watch', {'items': [event['guid']]})

    # update the planning with an added coverage
    planning['coverages'].append({
        "planning": {
            "g2_content_type": "video",
            "slugline": "Vivid planning item",
            "internal_note": "internal note here",
            "genre": [
                {
                    "name": "Article (news)",
                    "qcode": "Article"
                }
            ],
            "ednote": "ed note here",
            "scheduled": "2018-05-29T10:51:52+0000"
        },
        "coverage_status": {
            "name": "coverage intended",
            "label": "Planned",
            "qcode": "ncostat:int"
        },
        "workflow_status": "draft",
        "firstcreated": "2018-05-29T10:55:00+0000",
        "coverage_id": "coverage-3"
    })

    push_mock = mocker.patch('newsroom.agenda.agenda.push_notification')
    with app.mail.record_messages() as outbox:
        post_json(client, '/push', planning)
    notifications = get_user_notifications(user_id)

    assert len(outbox) == 1
    assert 'Subject: Prime minister press conference - Coverage updated' in str(outbox[0])
    assert '! Video coverage \'Vivid planning item\' due' in str(outbox[0])
    assert push_mock.call_args[0][0] == 'agenda_update'
    assert push_mock.call_args[1]['item']['_id'] == 'foo'
    assert len(push_mock.call_args[1]['users']) == 1
    assert len(notifications) == 1
    assert notifications[0]['_id'] == '{}_foo'.format(user_id)


@fixture
def test_filter_killed_events(client, app):
    event = deepcopy(test_event)
    post_json(client, '/push', event)
    events = get_json(client, '/agenda/search')
    assert 1 == len(events['_items'])

    event['state'] = 'cancelled'
    post_json(client, '/push', event)
    events = get_json(client, '/agenda/search')
    assert 1 == len(events['_items'])
    assert 'cancelled' == events['_items'][0]['state']

    event['state'] = 'killed'
    post_json(client, '/push', event)
    events = get_json(client, '/agenda/search')
    assert 0 == len(events['_items'])

    parsed = get_json(client, '/agenda/%s' % event['guid'])
    assert 'killed' == parsed['state']


@fixture
def test_push_cancelled_planning_cancels_adhoc_planning(client, app):
    # pushing an event to create the index
    event = deepcopy(test_event)
    event['guid'] = 'foo6'
    client.post('/push', data=json.dumps(event), content_type='application/json')

    # remove event link from planning item
    planning = deepcopy(test_planning)
    planning['guid'] = 'bar3'
    planning['event_item'] = None

    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('bar3', 'agenda')
    assert parsed['state'] == 'scheduled'

    # cancel planning item
    planning['state'] = 'cancelled'
    planning['ednote'] = '-------------------------\nPlanning cancelled\nReason: Test\n',

    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('bar3', 'agenda')
    assert parsed['state'] == 'cancelled'
    assert 'Reason' in parsed['ednote'][0]


@fixture
def test_push_update_for_an_item_with_coverage(client, app, mocker):
    test_item = {
        'type': 'text',
        'guid': 'item',
        'planning_id': test_planning['_id'],
        'coverage_id': test_planning['coverages'][0]['coverage_id'],
    }
    post_json(client, '/push', test_event)
    post_json(client, '/push', test_planning)
    post_json(client, '/push', test_item)

    item = get_json(client, '/agenda/foo')
    coverages = item.get('coverages')

    assert coverages[0]['coverage_id'] == test_item['coverage_id']
    assert coverages[0]['delivery_id'] == test_item['guid']
    assert coverages[0]['delivery_href'] == '/wire/%s' % test_item['guid']

    wire_item = get_json(client, '/wire/item')
    assert wire_item['_id'] == 'item'

    updated_item = {
        'type': 'text',
        'guid': 'update',
        'evolvedfrom': 'item',
    }

    post_json(client, '/push', updated_item)

    item = get_json(client, '/agenda/foo')
    coverages = item.get('coverages')

    assert coverages[0]['coverage_id'] == test_item['coverage_id']
    assert coverages[0]['delivery_id'] == updated_item['guid']
    assert coverages[0]['delivery_href'] == '/wire/%s' % updated_item['guid']

    wire_item = get_json(client, '/wire/update')
    assert wire_item['_id'] == 'update'


@fixture
def test_push_coverages_with_linked_stories(client, app):
    event = deepcopy(test_event)
    event['guid'] = 'foo7'
    client.post('/push', data=json.dumps(event), content_type='application/json')

    planning = deepcopy(test_planning)
    planning['guid'] = 'bar7'
    planning['event_item'] = 'foo7'
    planning['coverages'][0]['deliveries'] = [{
        'item_id': 'item7',
        'item_state': 'published',
    }]
    planning['coverages'][0]['workflow_status'] = 'completed'

    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo7', 'agenda')
    assert 2 == len(parsed['coverages'])
    assert parsed['coverages'][0]['delivery_id'] == 'item7'
    assert parsed['coverages'][0]['delivery_href'] == '/wire/item7'

    planning['coverages'][0]['deliveries'] = []
    planning['coverages'][0]['workflow_status'] = 'active'
    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo7', 'agenda')
    assert 2 == len(parsed['coverages'])
    assert parsed['coverages'][0]['delivery_id'] is None
    assert parsed['coverages'][0]['delivery_href'] is None


@fixture
def test_push_coverages_with_updates_to_linked_stories(client, app):
    event = deepcopy(test_event)
    event['guid'] = 'foo7'
    client.post('/push', data=json.dumps(event), content_type='application/json')

    planning = deepcopy(test_planning)
    planning['guid'] = 'bar7'
    planning['event_item'] = 'foo7'
    planning['coverages'][0]['deliveries'] = [{
        'item_id': 'item7',
        'item_state': 'published',
    }]
    planning['coverages'][0]['workflow_status'] = 'completed'

    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo7', 'agenda')
    assert 2 == len(parsed['coverages'])
    assert parsed['coverages'][0]['delivery_id'] == 'item7'
    assert parsed['coverages'][0]['delivery_href'] == '/wire/item7'

    planning['coverages'][0]['deliveries'].append({
        'item_id': 'item8',
        'item_state': 'in_progress',
        'sequence_no': 1,
    })

    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo7', 'agenda')
    assert 2 == len(parsed['coverages'])
    assert parsed['coverages'][0]['delivery_id'] == 'item7'
    assert parsed['coverages'][0]['delivery_href'] == '/wire/item7'

    planning['coverages'][0]['deliveries'].append({
        'item_id': 'item8',
        'item_state': 'published',
        'sequence_no': 2,
    })

    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo7', 'agenda')
    assert 2 == len(parsed['coverages'])
    assert parsed['coverages'][0]['delivery_id'] == 'item8'
    assert parsed['coverages'][0]['delivery_href'] == '/wire/item8'


@fixture
def test_push_coverages_with_correction_to_linked_stories(client, app):
    event = deepcopy(test_event)
    event['guid'] = 'foo7'
    client.post('/push', data=json.dumps(event), content_type='application/json')

    planning = deepcopy(test_planning)
    planning['guid'] = 'bar7'
    planning['event_item'] = 'foo7'
    planning['coverages'][0]['deliveries'] = [{
        'item_id': 'item7',
        'item_state': 'published',
    }]
    planning['coverages'][0]['workflow_status'] = 'completed'

    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo7', 'agenda')
    assert 2 == len(parsed['coverages'])
    assert parsed['coverages'][0]['delivery_id'] == 'item7'
    assert parsed['coverages'][0]['delivery_href'] == '/wire/item7'

    # Publish an update to the original story
    planning['coverages'][0]['deliveries'].append({
        'item_id': 'item8',
        'item_state': 'published',
        'sequence_no': 1,
    })

    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo7', 'agenda')
    assert 2 == len(parsed['coverages'])
    # Coverage should point to the latest version
    assert parsed['coverages'][0]['delivery_id'] == 'item8'
    assert parsed['coverages'][0]['delivery_href'] == '/wire/item8'

    # Publish a correction to the latest version
    planning['coverages'][0]['deliveries'].append({
        'item_id': 'item8',
        'item_state': 'corrected',
        'sequence_no': 1,
    })

    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo7', 'agenda')
    assert 2 == len(parsed['coverages'])
    # Coverage should still point to the latest version
    assert parsed['coverages'][0]['delivery_id'] == 'item8'
    assert parsed['coverages'][0]['delivery_href'] == '/wire/item8'


@fixture
def test_push_event_from_planning(client, app):
    plan = deepcopy(test_planning)
    plan['guid'] = 'adhoc_plan'
    plan['planning_date'] = '2018-05-29T00:00:00+0000'
    plan.pop('event_item', None)
    post_json(client, '/push', plan)
    parsed = get_entity_or_404(plan['guid'], 'agenda')

    assert parsed['slugline'] == test_planning['slugline']
    assert parsed['headline'] == test_planning['headline']
    assert parsed['definition_short'] == test_planning['description_text']
    assert 1 == len(parsed['service'])
    assert 'e' == parsed['service'][0]['code']
    assert 1 == len(parsed['subject'])
    assert '01009000' == parsed['subject'][0]['code']
    assert parsed.get('event_id') is None
    assert parsed['guid'] == plan['guid']
    assert parsed['dates']['start'].isoformat() == plan['planning_date'].replace('0000', '00:00')
    assert parsed['dates']['end'].isoformat() == plan['planning_date'].replace('0000', '00:00')

    event = deepcopy(test_event)
    event['guid'] = 'retrospective_event'
    event['plans'] = ['adhoc_plan']
    post_json(client, '/push', event)
    parsed = get_entity_or_404(plan['guid'], 'agenda')

    assert parsed['slugline'] == test_event['slugline']
    assert parsed['definition_short'] == test_event['definition_short']
    assert parsed['guid'] == event['guid']

    assert 1 == len(parsed['service'])
    assert 'a' == parsed['service'][0]['code']
    assert 1 == len(parsed['subject'])
    assert '06002002' == parsed['subject'][0]['code']
    assert parsed['dates']['start'].isoformat() == event['dates']['start'].replace('0000', '00:00')
    assert parsed['dates']['end'].isoformat() == event['dates']['end'].replace('0000', '00:00')


@fixture
def test_coverages_delivery_sequence_has_default(client, app):
    event = deepcopy(test_event)
    event['guid'] = 'foo7'
    client.post('/push', data=json.dumps(event), content_type='application/json')

    planning = deepcopy(test_planning)
    planning['guid'] = 'bar7'
    planning['event_item'] = 'foo7'
    planning['coverages'][0]['deliveries'] = [{
        'item_id': 'item7',
        'item_state': 'published',
        'sequence_no': None
    }]
    planning['coverages'][0]['workflow_status'] = 'completed'
    planning['coverages'][0]['coverage_type'] = 'text'

    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo7', 'agenda')
    assert 2 == len(parsed['coverages'])
    assert parsed['coverages'][0]['delivery_id'] == 'item7'
    assert parsed['coverages'][0]['delivery_href'] == '/wire/item7'
    assert parsed['coverages'][0]['deliveries'][0]['sequence_no'] == 0


@fixture
def test_item_planning_reference_set_on_fulfill(client, app):
    planning = deepcopy(test_planning)
    planning['guid'] = 'bar1'
    planning['event_item'] = None
    post_json(client, '/push', planning)

    item = deepcopy(text_item)
    post_json(client, '/push', item)

    planning = deepcopy(test_planning)
    planning['guid'] = 'bar1'
    planning['event_item'] = None
    planning['coverages'][0]['deliveries'] = [{
        'item_id': 'urn:newsml:localhost:2020-08-06T15:59:39.183090:1f02e9bb-3007-48f3-bfad-ffa6107f87bd',
        'item_state': 'published',
    }]
    planning['coverages'][0]['workflow_status'] = 'completed'

    post_json(client, '/push', planning)

    parsed = get_entity_or_404('urn:newsml:localhost:2020-08-06T15:59:39.183090:1f02e9bb-3007-48f3-bfad-ffa6107f87bd',
                               'content_api')
    assert parsed['planning_id'] == 'bar1'
    assert parsed['coverage_id'] == 'urn:newsml:localhost:5000:2018-05-28T20:55:' \
                                    '00.496765:197d3430-9cd1-4b93-822f-c3c050b5b6ab'
