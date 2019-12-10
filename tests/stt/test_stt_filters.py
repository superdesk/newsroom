
import hmac
from flask import json
from newsroom.utils import get_entity_or_404
from tests.fixtures import init_auth  # noqa


def get_signature_headers(data, key):
    mac = hmac.new(key, data.encode(), 'sha1')
    return {'x-superdesk-signature': 'sha1=%s' % mac.hexdigest()}


item = {
    'guid': 'foo',
    'type': 'text',
    'headline': 'Foo',
    'firstcreated': '2017-11-27T08:00:57+0000',
    'body_html': '<p>foo bar</p>',
    'renditions': {
        'thumbnail': {
            'href': 'http://example.com/foo',
            'media': 'foo',
        }
    },
    'genre': [{'name': 'News', 'code': 'news'}],
    'associations': {
        'featured': {
            'type': 'picture',
            'renditions': {
                'thumbnail': {
                    'href': 'http://example.com/bar',
                    'media': 'bar',
                }
            }
        }
    },
    'event_id': 'urn:event/1',
    'coverage_id': 'urn:coverage/1',
}


def test_push_updates_ednote(client, app):
    from stt.filters import init_app
    init_app(app)
    payload = item.copy()
    payload['ednote'] = 'foo'
    client.post('/push', data=json.dumps(payload), content_type='application/json')
    parsed = get_entity_or_404(item['guid'], 'items')
    assert parsed['ednote'] == 'foo'

    payload['guid'] = 'bar'
    payload['extra'] = {'sttnote_private': 'private message'}
    client.post('/push', data=json.dumps(payload), content_type='application/json')
    parsed = get_entity_or_404(payload['guid'], 'items')
    assert parsed['ednote'] == 'foo\nprivate message'

    payload['guid'] = 'baz'
    payload.pop('ednote')
    payload['extra'] = {'sttnote_private': 'private message'}
    client.post('/push', data=json.dumps(payload), content_type='application/json')
    parsed = get_entity_or_404(payload['guid'], 'items')
    assert parsed['ednote'] == 'private message'


def test_push_firstcreated_is_older_copies_to_versioncreated(client, app):
    from stt.filters import init_app
    init_app(app)
    payload = item.copy()
    payload['firstpublished'] = '2017-11-26T08:00:57+0000'
    payload['versioncreated'] = '2017-11-27T08:00:57+0000'
    payload['version'] = '1'
    client.post('/push', data=json.dumps(payload), content_type='application/json')
    parsed = get_entity_or_404(item['guid'], 'items')
    assert parsed['firstpublished'] == parsed['versioncreated']

    # post the same story again as a correction, versioncreated is preserved
    payload['versioncreated'] = '2017-11-28T08:00:57+0000'
    client.post('/push', data=json.dumps(payload), content_type='application/json')
    parsed = get_entity_or_404(item['guid'], 'items')
    assert parsed['firstpublished'].strftime('%Y%m%d%H%M') == '201711260800'
    assert parsed['versioncreated'].strftime('%Y%m%d%H%M') == '201711280800'


def test_push_new_versions_will_update_ancestors(client, app):
    from stt.filters import init_app
    init_app(app)
    payload = item.copy()
    payload['version'] = '1'
    client.post('/push', data=json.dumps(payload), content_type='application/json')
    parsed = get_entity_or_404(item['guid'], 'items')
    assert parsed['version'] == '1'

    # post the new version of the story, it will update the ancestors
    payload['version'] = '2'
    payload['headline'] = 'bar'
    client.post('/push', data=json.dumps(payload), content_type='application/json')
    new_story = get_entity_or_404('foo:2', 'items')
    original_story = get_entity_or_404(item['guid'], 'items')
    assert new_story['version'] == '2'
    assert new_story['ancestors'] == ['foo']
    assert new_story['headline'] == 'bar'
    assert original_story['nextversion'] == 'foo:2'

    # post the same version of the story, it will update keep ancestors but update the current story
    payload['headline'] = 'baz'
    client.post('/push', data=json.dumps(payload), content_type='application/json')
    new_story = get_entity_or_404('foo:2', 'items')
    original_story = get_entity_or_404(item['guid'], 'items')
    assert new_story['version'] == '2'
    assert new_story['ancestors'] == ['foo']
    assert new_story['headline'] == 'baz'
    assert original_story['nextversion'] == 'foo:2'
