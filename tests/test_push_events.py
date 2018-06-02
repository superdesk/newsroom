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
        'end': '2018-05-20T05:00:00+0000',
        'start': '2018-05-20T04:00:00+0000',
        'tz': 'Australia/Sydney'
    },
    'guid': 'foo',
    'item_id': 'foo',
    '_id': 'foo',
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


def test_push_parsed_event(client, app):
    client.post('/push', data=json.dumps(event), content_type='application/json')
    parsed = get_entity_or_404(event['guid'], 'planning_search')
    assert type(parsed['firstcreated']) == datetime
    assert 1 == len(parsed['event_contact_info'])
    assert 1 == len(parsed['location'])
