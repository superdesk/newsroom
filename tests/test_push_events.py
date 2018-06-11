from flask import json
from datetime import datetime
from newsroom.utils import get_entity_or_404

event = {
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
    'item_id': 'foo',
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

planning = {
    "description_text": "description here",
    "_current_version": 1,
    "agendas": [],
    "anpa_category": [
        {
            "name": "Entertainment",
            "subject": "01000000",
            "qcode": "e"
        }
    ],
    "item_id": "urn:newsml:localhost:5000:2018-05-28T20:54:59.868362:4bdb1f38-4f2b-469a-8a2f-a774d2d38462",
    "ednote": "ed note here",
    "slugline": "Vivid planning item",
    "headline": "Planning headline",
    "planning_date": "2018-05-28T10:51:52+0000",
    "state": "draft",
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
            "coverage_id": "urn:newsml:localhost:5000:2018-05-28T20:55:00.496765:197d3430-9cd1-4b93-822f-c3c050b5b6ab"
        },
        {
            "planning": {
                "g2_content_type": "picture",
                "slugline": "Vivid planning item",
                "internal_note": "internal note here",
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
            "coverage_id": "urn:newsml:localhost:5000:2018-05-28T20:55:00.526019:88f5bc77-f0ce-4775-acc1-e728f10f79f7"
        }
    ],
    "_id": "urn:newsml:localhost:5000:2018-05-28T20:54:59.868362:4bdb1f38-4f2b-469a-8a2f-a774d2d38462",
    "urgency": 3,
    "guid": "urn:newsml:localhost:5000:2018-05-28T20:54:59.868362:4bdb1f38-4f2b-469a-8a2f-a774d2d38462",
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


def test_push_parsed_event(client, app):
    client.post('/push', data=json.dumps(event), content_type='application/json')
    parsed = get_entity_or_404(event['guid'], 'agenda')
    assert type(parsed['firstcreated']) == datetime
    assert 1 == len(parsed['dates'])
    assert 1 == len(parsed['event']['event_contact_info'])
    assert 1 == len(parsed['location'])

    resp = client.get('/agenda?date_to=now/d')
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])


def test_push_cancelled_event(client, app):
    # first push
    client.post('/push', data=json.dumps(event), content_type='application/json')

    # update comes in
    event['pubstatus'] = 'cancelled'
    event['state'] = 'cancelled'

    client.post('/push', data=json.dumps(event), content_type='application/json')
    parsed = get_entity_or_404(event['guid'], 'agenda')
    assert type(parsed['firstcreated']) == datetime
    assert 1 == len(parsed['event']['event_contact_info'])
    assert 1 == len(parsed['location'])
    assert parsed['event']['pubstatus'] == 'cancelled'


def test_push_updated_event(client, app):
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
    assert type(parsed['firstcreated']) == datetime
    assert 1 == len(parsed['event']['event_contact_info'])
    assert 1 == len(parsed['location'])
    assert parsed['dates'][0]['end'] == '2018-06-30T09:00:00+0000'


def test_push_recurring_event(client, app):
    # update event to recurring
    event['state'] = 'scheduled'
    event['dates'] = {
        'start': '2029-11-27T01:00:00+0000',
        'end': '2029-11-27T04:00:00+0000',
        'tz': 'Australia/Sydney',
        'recurring_rule': {
            'frequency': 'DAILY',
            'interval': 1,
            'count': 6,
            'endRepeatMode': 'count',
            'until': '__none__'
        }
    }
    client.post('/push', data=json.dumps(event), content_type='application/json')
    parsed = get_entity_or_404(event['guid'], 'agenda')
    assert type(parsed['firstcreated']) == datetime
    assert 6 == len(parsed['dates'])


def test_push_repush_recurring_event(client, app):
    # update event to recurring
    event['state'] = 'scheduled'
    event['dates'] = {
        'start': '2029-11-27T01:00:00+0000',
        'end': '2029-11-27T04:00:00+0000',
        'tz': 'Australia/Sydney',
        'recurring_rule': {
            'frequency': 'DAILY',
            'interval': 1,
            'count': 6,
            'endRepeatMode': 'count',
            'until': '__none__'
        }
    }

    # first push
    client.post('/push', data=json.dumps(event), content_type='application/json')

    event['state'] = 'rescheduled'
    event['dates'] = {
        'start': '2029-12-27T01:00:00+0000',
        'end': '2029-12-27T04:00:00+0000',
        'tz': 'Australia/Sydney',
        'recurring_rule': {
            'frequency': 'DAILY',
            'interval': 1,
            'count': 8,
            'endRepeatMode': 'count',
            'until': '__none__'
        }
    }

    client.post('/push', data=json.dumps(event), content_type='application/json')
    parsed = get_entity_or_404(event['guid'], 'agenda')
    assert type(parsed['firstcreated']) == datetime
    assert 8 == len(parsed['dates'])


def test_push_parsed_planning_for_an_existing_event(client, app):
    client.post('/push', data=json.dumps(event), content_type='application/json')
    parsed = get_entity_or_404(event['guid'], 'agenda')
    assert type(parsed['firstcreated']) == datetime
    assert 1 == len(parsed['dates'])
    assert 1 == len(parsed['event']['event_contact_info'])
    assert 1 == len(parsed['location'])

    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo', 'agenda')
    assert parsed['headline'] == 'Planning headline'


def test_push_cancelled_planning_for_an_existing_event(client, app):
    client.post('/push', data=json.dumps(event), content_type='application/json')
    parsed = get_entity_or_404(event['guid'], 'agenda')
    assert type(parsed['firstcreated']) == datetime
    assert 1 == len(parsed['dates'])
    assert 1 == len(parsed['event']['event_contact_info'])
    assert 1 == len(parsed['location'])

    # first push
    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo', 'agenda')
    assert len(parsed['dates'][0]['coverages']) == 2
    assert len(parsed['planning_items']) == 1

    # update the planning for cancel
    planning['pubstatus'] = 'cancelled'
    planning['state'] = 'cancelled'

    # second push
    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404('foo', 'agenda')
    assert len(parsed['dates'][0]['coverages']) == 0
    assert len(parsed['planning_items']) == 0
