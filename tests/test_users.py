from flask import url_for
from pytest import fixture


@fixture(autouse=True)
def init(app):
    app.data.insert('users', [{
        '_id': 1,
        'name': 'admin',
        'email': 'admin@sourcefabric.org',
        'password': '$2b$12$HGyWCf9VNfnVAwc2wQxQW.Op3Ejk7KIGE6urUXugpI0KQuuK6RWIG',
        'user_type': 'administrator',
        'is_validated': True,
        'is_enabled': True,
        'is_approved': True
    }])


def test_user_list_fails_for_anonymous_user(client):
    response = client.get('/users')
    assert response.status_code == 403
    assert b'403 Forbidden' in response.data


def test_login_succeeds_for_admin(client):
    response = client.post(
        url_for('auth.login'),
        data={'email': 'admin@sourcefabric.org', 'password': 'admin'},
        follow_redirects=True
    )
    assert response.status_code == 200
    assert b'<h5>There are no items yet.</h5>' in response.data
