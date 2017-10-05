
import io
import zipfile

from flask import json
from pytest import fixture

from tests.test_users import test_login_succeeds_for_admin, init as users_init


items = [{
    '_id': 'tag:foo',
    'version': 2,
    'headline': 'Amazon Is Opening More Bookstores',
    'slugline': 'AMAZON-BOOKSTORE-OPENING',
    'body_html': '<p>New stores will open in DC and Austin in 2018.</p>',
}]


@fixture(autouse=True)
def init(app):
    app.data.insert('items', items)


def test_item_download(client):
    resp = client.get('/download/tag:foo?version=2')
    assert resp.status_code == 200
    assert resp.mimetype == 'application/zip'
    _file = io.BytesIO(resp.get_data())
    with zipfile.ZipFile(_file) as zf:
        assert 'tagfoo.txt' in zf.namelist()
        content = zf.open('tagfoo.txt').read().decode('utf-8').split('\n')
        assert 'AMAZON-BOOKSTORE-OPENING' in content[0]
        assert 'Amazon Is Opening More Bookstores' in content[1]
        assert '<p>' not in content


def test_item_detail(client):
    resp = client.get('/wire/tag:foo')
    assert resp.status_code == 200
    html = resp.get_data().decode('utf-8')
    assert '<h1>Amazon Is Opening More Bookstores</h1>' in html


def test_share_item(client, app):
    user_ids = app.data.insert('users', [{
        'email': 'foo@bar.com',
        'first_name': 'Foo',
        'last_name': 'Bar',
    }])

    # create admin
    users_init(app)
    test_login_succeeds_for_admin(client)

    with app.mail.record_messages() as outbox:
        resp = client.post('/wire/tag:foo/share', data=json.dumps({
            'item': 'tag:foo',
            'users': [str(user_ids[0])],
            'message': 'Some info message',
        }), content_type='application/json')

        assert resp.status_code == 201, resp.get_data().decode('utf-8')
        assert len(outbox) == 1
        assert outbox[0].recipients == ['foo@bar.com']
        assert outbox[0].sender == 'admin@sourcefabric.org'
        assert outbox[0].subject == 'From AAP Newsroom: %s' % items[0]['headline']
        assert 'Hi Foo Bar' in outbox[0].body
        assert 'admin admin shared ' in outbox[0].body
        assert items[0]['headline'] in outbox[0].body
        assert 'http://localhost:5050/wire/tag:foo' in outbox[0].body
        assert 'Some info message' in outbox[0].body
