from flask import json
from pytest import fixture
from bson import ObjectId
from .test_users import test_login_succeeds_for_admin, init as user_init  # noqa
from .fixtures import PUBLIC_USER_ID

company_id = "5c3eb6975f627db90c84093c"


@fixture(autouse=True)
def init(app):
    app.data.insert('companies', [{
        '_id': ObjectId(company_id),
        'phone': '2132132134',
        'sd_subscriber_id': '12345',
        'name': 'Press Co.',
        'is_enabled': True,
        'contact_name': 'Tom'
    }])

    app.data.insert('watch_lists', [{
        "_id": ObjectId("5db11ec55f627d8aa0b545fb"),
        "is_enabled": True,
        "users": [
            ObjectId("5c53afa45f627d8333220f15"),
            ObjectId("5c4684645f627debec1dc3db")
        ],
        "company": ObjectId(company_id),
        "subject": "",
        "name": "W1",
        "_etag": "f023a8db3cdbe31e63ac4b0e6864f5a86ef07253",
        "description": "D3",
        "alert_type": "full_text",
        "query": "hgnhgnhg",
        "schedule": {
            "interval": "immediate"
        }}])


def test_non_admin_actions_fail(client, app):
    user_id = str(PUBLIC_USER_ID)
    with client.session_transaction() as session:
        session['user'] = user_id
        session['name'] = 'public'
        session['user_type'] = 'public'

        response = client.post('/watch_lists/new', data=json.dumps({
            "is_enabled": True,
            "users": [
                ObjectId("5c53afa45f627d8333220f15"),
                ObjectId("5c4684645f627debec1dc3db")
            ],
            "company": ObjectId("5c3eb6975f627db90c84093c"),
            "subject": "",
            "name": "W2",
            "_etag": "f023a8db3cdbe31e63ac4b0e6864f5a86ef07253",
            "description": "D3",
            "alert_type": "full_text",
            "query": "hgnhgnhg",
            "schedule": {
                "interval": "immediate"
            }}), content_type='application/json')
        assert response.status_code == 403

        response = client.post('/watch_lists/5db11ec55f627d8aa0b545fb/users', data=json.dumps({
                "users": [ObjectId("5c53afa45f627d8333220f15")]}), content_type='application/json')
        assert response.status_code == 403

        response = client.post('/watch_lists/5db11ec55f627d8aa0b545fb/schedule', data=json.dumps({
            "schedule": {"interval": "immediate"}}), content_type='application/json')
        assert response.status_code == 403

        response = client.get('/watch_lists/schedule_companies')
        assert response.status_code == 403

        response = client.post('/watch_lists/5db11ec55f627d8aa0b545fb/users', data=json.dumps({
            "users": [ObjectId("5c53afa45f627d8333220f15")]}), content_type='application/json')
        assert response.status_code == 403


def test_fetch_watch_lists(client):
    test_login_succeeds_for_admin(client)
    response = client.get('/watch_lists/all')
    assert response.status_code == 200
    items = json.loads(response.get_data())
    assert 1 == len(items)
    assert "5db11ec55f627d8aa0b545fb" == items[0]['_id']


def test_post_watch_lists(client):
    test_login_succeeds_for_admin(client)
    response = client.post('/watch_lists/new', data=json.dumps({
        "is_enabled": True,
        "users": [
            ObjectId("5c53afa45f627d8333220f15"),
            ObjectId("5c4684645f627debec1dc3db")
        ],
        "company": ObjectId("5c3eb6975f627db90c84093c"),
        "subject": "",
        "name": "W2",
        "_etag": "f023a8db3cdbe31e63ac4b0e6864f5a86ef07253",
        "description": "D3",
        "alert_type": "full_text",
        "query": "hgnhgnhg",
        "schedule": {
            "interval": "immediate"
        }}), content_type='application/json')
    assert response.status_code == 201
    response = client.get('/watch_lists/all')
    assert response.status_code == 200
    items = json.loads(response.get_data())
    assert 2 == len(items)
    assert "W1" == items[0]['name']
    assert "W2" == items[1]['name']


def test_set_watch_list_users(client):
    test_login_succeeds_for_admin(client)

    response = client.post('/watch_lists/5db11ec55f627d8aa0b545fb/users', data=json.dumps({
            "users": [ObjectId("5c53afa45f627d8333220f15")]}), content_type='application/json')
    assert response.status_code == 200
    response = client.get('/watch_lists/all')
    assert response.status_code == 200
    items = json.loads(response.get_data())
    assert 1 == len(items)
    assert ["5c53afa45f627d8333220f15"] == items[0]['users']


def test_set_watch_list_schedule(client):
    test_login_succeeds_for_admin(client)

    response = client.post('/watch_lists/5db11ec55f627d8aa0b545fb/schedule', data=json.dumps({
        "schedule": {"interval": "four_hour"}}), content_type='application/json')
    assert response.status_code == 200
    response = client.get('/watch_lists/all')
    assert response.status_code == 200
    items = json.loads(response.get_data())
    assert 1 == len(items)
    assert "four_hour" == items[0]['schedule']['interval']


def test_get_companies_with_watch_list_schedules(client):
    test_login_succeeds_for_admin(client)
    response = client.get('/watch_lists/schedule_companies')
    assert response.status_code == 200
    items = json.loads(response.get_data())
    assert 1 == len(items)
    assert company_id == items[0]['_id']
