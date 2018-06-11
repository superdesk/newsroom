from flask import json
from datetime import datetime
from newsroom.utils import get_entity_or_404

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
    "type": "planning"
}


def test_push_parsed_planning(client, app):
    client.post('/push', data=json.dumps(planning), content_type='application/json')
    parsed = get_entity_or_404(planning['guid'], 'planning_search')
    assert type(parsed['firstcreated']) == datetime
    assert 2 == len(parsed['coverages'])
    assert 1 == len(parsed['subject'])
