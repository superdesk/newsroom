from flask import json
from bson import ObjectId
from newsroom.topics.views import get_topic_url


topic = {
    'label': 'Foo',
    'query': 'foo',
    'notifications': False,
    'topic_type': 'wire',
    'navigation': 'xyz',
}

agenda_topic = {
    'label': 'Foo',
    'query': 'foo',
    'notifications': False,
    'topic_type': 'agenda',
    'navigation': 'abc',
}

user = str(ObjectId())
topics_url = 'api/users/%s/topics' % user


def test_topics_no_session(client):
    resp = client.get(topics_url)
    assert 401 == resp.status_code
    resp = client.post(topics_url, data=topic)
    assert 401 == resp.status_code


def test_post_topic_user(client):
    with client as app:
        with client.session_transaction() as session:
            session['user'] = str(ObjectId())
        resp = app.post(topics_url, data=topic)
        assert 201 == resp.status_code
        resp = app.get(topics_url)
        assert 200 == resp.status_code
        data = json.loads(resp.get_data())
        assert 1 == data['_meta']['total']


def test_update_topic_fails_for_different_user(client):
    with client as app:
        with client.session_transaction() as session:
            session['user'] = str(ObjectId())
        resp = app.post(topics_url, data=topic)
        assert 201 == resp.status_code

        resp = app.get(topics_url)
        data = json.loads(resp.get_data())
        id = data['_items'][0]['_id']

        with client.session_transaction() as session:
            session['name'] = 'tester'
        resp = app.post('topics/{}'.format(id), data=json.dumps({'label': 'test123'}), content_type='application/json')
        assert 403 == resp.status_code


def test_update_topic(client):
    with client as app:
        with client.session_transaction() as session:
            session['user'] = user
        resp = app.post(topics_url, data=topic)
        assert 201 == resp.status_code

        resp = app.get(topics_url)
        data = json.loads(resp.get_data())
        id = data['_items'][0]['_id']

        with client.session_transaction() as session:
            session['name'] = 'tester'
        resp = app.post('topics/{}'.format(id), data=json.dumps({'label': 'test123'}), content_type='application/json')
        assert 200 == resp.status_code

        resp = app.get(topics_url)
        data = json.loads(resp.get_data())
        assert 'test123' == data['_items'][0]['label']


def test_delete_topic(client):
    with client as app:
        with client.session_transaction() as session:
            session['user'] = user
        resp = app.post(topics_url, data=topic)
        assert 201 == resp.status_code

        resp = app.get(topics_url)
        data = json.loads(resp.get_data())
        id = data['_items'][0]['_id']

        with client.session_transaction() as session:
            session['name'] = 'tester'
        resp = app.delete('topics/{}'.format(id))
        assert 200 == resp.status_code

        resp = app.get(topics_url)
        data = json.loads(resp.get_data())
        assert 0 == len(data['_items'])


def test_share_wire_topics(client, app):
    topic_ids = app.data.insert('topics', [topic])
    topic['_id'] = topic_ids[0]
    user_ids = app.data.insert('users', [{
        'email': 'foo@bar.com',
        'first_name': 'Foo',
        'last_name': 'Bar',
    }, {
        'email': 'admin@bar.com',
        'first_name': 'System',
        'last_name': 'Admin',
    }])

    with app.mail.record_messages() as outbox:
        with client.session_transaction() as session:
            session['user'] = user_ids[1]
            session['name'] = 'tester'
        resp = client.post('/topic_share', data=json.dumps({
            'items': [topic],
            'users': [str(user_ids[0])],
            'message': 'Some info message',
        }), content_type='application/json')

        assert resp.status_code == 201, resp.get_data().decode('utf-8')
        assert len(outbox) == 1
        assert outbox[0].recipients == ['foo@bar.com']
        assert outbox[0].sender == 'admin@bar.com'
        assert outbox[0].subject == 'From AAP Newsroom: %s' % topic['label']
        assert 'Hi Foo Bar' in outbox[0].body
        assert 'System Admin shared ' in outbox[0].body
        assert topic['query'] in outbox[0].body
        assert 'Some info message' in outbox[0].body
        assert '/wire' in outbox[0].body


def test_share_agenda_topics(client, app):
    topic_ids = app.data.insert('topics', [agenda_topic])
    agenda_topic['_id'] = topic_ids[0]
    user_ids = app.data.insert('users', [{
        'email': 'foo@bar.com',
        'first_name': 'Foo',
        'last_name': 'Bar',
    }, {
        'email': 'admin@bar.com',
        'first_name': 'System',
        'last_name': 'Admin',
    }])

    with app.mail.record_messages() as outbox:
        with client.session_transaction() as session:
            session['user'] = user_ids[1]
            session['name'] = 'tester'
        resp = client.post('/topic_share', data=json.dumps({
            'items': [agenda_topic],
            'users': [str(user_ids[0])],
            'message': 'Some info message',
        }), content_type='application/json')

        assert resp.status_code == 201, resp.get_data().decode('utf-8')
        assert len(outbox) == 1
        assert outbox[0].recipients == ['foo@bar.com']
        assert outbox[0].sender == 'admin@bar.com'
        assert outbox[0].subject == 'From AAP Newsroom: %s' % agenda_topic['label']
        assert 'Hi Foo Bar' in outbox[0].body
        assert 'System Admin shared ' in outbox[0].body
        assert agenda_topic['query'] in outbox[0].body
        assert 'Some info message' in outbox[0].body
        assert '/agenda' in outbox[0].body


def test_get_topic_share_url(client, app):
    app.config['CLIENT_URL'] = 'http://newsroom.com'

    topic = {'topic_type': 'wire', 'query': 'art exhibition'}
    assert get_topic_url(topic) == 'http://newsroom.com/wire?q=art%20exhibition'

    topic = {'topic_type': 'wire', 'filter': {"location": [["Sydney"]]}}
    assert get_topic_url(topic) == 'http://newsroom.com/wire?filter=%7B%22location%22%3A%20%5B%5B%22Sydney%22%5D%5D%7D'

    topic = {'topic_type': 'wire', 'navigation': '123'}
    assert get_topic_url(topic) == 'http://newsroom.com/wire?navigation=123'

    topic = {'topic_type': 'wire', 'created': {'from': '2018-06-01'}}
    assert get_topic_url(topic) == 'http://newsroom.com/wire?created=%7B%22from%22%3A%20%222018-06-01%22%7D'

    topic = {
        'topic_type': 'wire',
        'query': 'art exhibition',
        'filter': {"urgency": [3]},
        'navigation': '123',
        'created': {'from': '2018-06-01'},
    }
    assert get_topic_url(topic) == 'http://newsroom.com/wire?q=art%20exhibition&filter=%7B%22urgency%22%3A%20%5B3%5D%7D&navigation=123&created=%7B%22from%22%3A%20%222018-06-01%22%7D' # noqa
