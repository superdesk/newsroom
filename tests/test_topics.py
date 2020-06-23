from flask import json
from newsroom.topics.views import get_topic_url
from .fixtures import init_company, PUBLIC_USER_ID, TEST_USER_ID  # noqa
from unittest import mock
from .utils import mock_send_email

topic = {
    'label': 'Foo',
    'query': 'foo',
    'notifications': False,
    'topic_type': 'wire',
    'navigation': ['xyz'],
}

agenda_topic = {
    'label': 'Foo',
    'query': 'foo',
    'notifications': False,
    'topic_type': 'agenda',
    'navigation': ['abc'],
}

user_id = str(PUBLIC_USER_ID)
test_user_id = str(TEST_USER_ID)
topics_url = 'api/users/%s/topics' % user_id


def test_topics_no_session(client):
    resp = client.get(topics_url)
    assert 401 == resp.status_code
    resp = client.post(topics_url, data=topic)
    assert 401 == resp.status_code


def test_post_topic_user(client):
    with client as app:
        with client.session_transaction() as session:
            session['user'] = user_id
        resp = app.post(
            topics_url,
            data=json.dumps(topic),
            content_type='application/json'
        )
        assert 201 == resp.status_code
        resp = app.get(topics_url)
        assert 200 == resp.status_code
        data = json.loads(resp.get_data())
        assert 1 == data['_meta']['total']


def test_update_topic_fails_for_different_user(client):
    with client as app:
        with client.session_transaction() as session:
            session['user'] = user_id
        resp = app.post(
            topics_url,
            data=json.dumps(topic),
            content_type='application/json'
        )
        assert 201 == resp.status_code

        resp = app.get(topics_url)
        data = json.loads(resp.get_data())
        _id = data['_items'][0]['_id']

        with client.session_transaction() as session:
            session['name'] = test_user_id
            session['user'] = test_user_id
        resp = app.post('topics/{}'.format(_id), data=json.dumps({'label': 'test123'}), content_type='application/json')
        assert 403 == resp.status_code


def test_update_topic(client):
    with client as app:
        with client.session_transaction() as session:
            session['user'] = user_id
        resp = app.post(
            topics_url,
            data=json.dumps(topic),
            content_type='application/json'
        )
        assert 201 == resp.status_code

        resp = app.get(topics_url)
        data = json.loads(resp.get_data())
        _id = data['_items'][0]['_id']

        with client.session_transaction() as session:
            session['name'] = user_id
        resp = app.post('topics/{}'.format(_id), data=json.dumps({'label': 'test123'}), content_type='application/json')
        assert 200 == resp.status_code

        resp = app.get(topics_url)
        data = json.loads(resp.get_data())
        assert 'test123' == data['_items'][0]['label']


def test_delete_topic(client):
    with client as app:
        with client.session_transaction() as session:
            session['user'] = user_id
        resp = app.post(
            topics_url,
            data=json.dumps(topic),
            content_type='application/json'
        )
        assert 201 == resp.status_code

        resp = app.get(topics_url)
        data = json.loads(resp.get_data())
        _id = data['_items'][0]['_id']

        with client.session_transaction() as session:
            session['name'] = user_id
        resp = app.delete('topics/{}'.format(_id))
        assert 200 == resp.status_code

        resp = app.get(topics_url)
        data = json.loads(resp.get_data())
        assert 0 == len(data['_items'])


@mock.patch('newsroom.topics.views.send_email', mock_send_email)
def test_share_wire_topics(client, app):
    topic_ids = app.data.insert('topics', [topic])
    topic['_id'] = topic_ids[0]

    with app.mail.record_messages() as outbox:
        with client.session_transaction() as session:
            session['user'] = user_id
            session['name'] = 'tester'
        resp = client.post('/topic_share', data=json.dumps({
            'items': topic,
            'users': [test_user_id],
            'message': 'Some info message',
        }), content_type='application/json')

        assert resp.status_code == 201, resp.get_data().decode('utf-8')
        assert len(outbox) == 1
        assert outbox[0].recipients == ['test@bar.com']
        assert outbox[0].sender == 'newsroom@localhost'
        assert outbox[0].subject == 'From AAP Newsroom: %s' % topic['label']
        assert 'Hi Test Bar' in outbox[0].body
        assert 'Foo Bar (foo@bar.com) shared ' in outbox[0].body
        assert topic['query'] in outbox[0].body
        assert 'Some info message' in outbox[0].body
        assert '/wire' in outbox[0].body


@mock.patch('newsroom.topics.views.send_email', mock_send_email)
def test_share_agenda_topics(client, app):
    topic_ids = app.data.insert('topics', [agenda_topic])
    agenda_topic['_id'] = topic_ids[0]

    with app.mail.record_messages() as outbox:
        with client.session_transaction() as session:
            session['user'] = user_id
            session['name'] = 'tester'
        resp = client.post('/topic_share', data=json.dumps({
            'items': agenda_topic,
            'users': [test_user_id],
            'message': 'Some info message',
        }), content_type='application/json')

        assert resp.status_code == 201, resp.get_data().decode('utf-8')
        assert len(outbox) == 1
        assert outbox[0].recipients == ['test@bar.com']
        assert outbox[0].sender == 'newsroom@localhost'
        assert outbox[0].subject == 'From AAP Newsroom: %s' % agenda_topic['label']
        assert 'Hi Test Bar' in outbox[0].body
        assert 'Foo Bar (foo@bar.com) shared ' in outbox[0].body
        assert agenda_topic['query'] in outbox[0].body
        assert 'Some info message' in outbox[0].body
        assert '/agenda' in outbox[0].body


def test_get_topic_share_url(client, app):
    app.config['CLIENT_URL'] = 'http://newsroom.com'

    topic = {'topic_type': 'wire', 'query': 'art exhibition'}
    assert get_topic_url(topic) == 'http://newsroom.com/wire?q=art%20exhibition'

    topic = {'topic_type': 'wire', 'filter': {"location": [["Sydney"]]}}
    assert get_topic_url(topic) == 'http://newsroom.com/wire?filter=%7B%22location%22%3A%20%5B%5B%22Sydney%22%5D%5D%7D'

    topic = {'topic_type': 'wire', 'navigation': ['123']}
    assert get_topic_url(topic) == 'http://newsroom.com/wire?navigation=%5B%22123%22%5D'

    topic = {'topic_type': 'wire', 'navigation': ['123', '456']}
    assert get_topic_url(topic) == 'http://newsroom.com/wire?navigation=%5B%22123%22%2C%20%22456%22%5D'

    topic = {'topic_type': 'wire', 'created': {'from': '2018-06-01'}}
    assert get_topic_url(topic) == 'http://newsroom.com/wire?created=%7B%22from%22%3A%20%222018-06-01%22%7D'

    topic = {
        'topic_type': 'wire',
        'query': 'art exhibition',
        'filter': {"urgency": [3]},
        'navigation': ['123'],
        'created': {'from': '2018-06-01'},
    }
    assert get_topic_url(topic) == 'http://newsroom.com/wire?' \
                                   'q=art%20exhibition' \
                                   '&filter=%7B%22urgency%22%3A%20%5B3%5D%7D' \
                                   '&navigation=%5B%22123%22%5D' \
                                   '&created=%7B%22from%22%3A%20%222018-06-01%22%7D'
