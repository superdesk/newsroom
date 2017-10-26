from flask import json
from bson import ObjectId

topic = {
    'label': 'Foo',
    'query': 'foo',
    'notifications': False,
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
