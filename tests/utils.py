from flask import json, current_app as app
from superdesk import get_resource_service
from superdesk.emails import SuperdeskMessage


def post_json(client, url, data):
    """Post json data to client."""
    resp = client.post(url, data=json.dumps(data, indent=2), content_type='application/json')
    assert resp.status_code in [200, 201], \
        'error %d on post to %s:\n%s' % (resp.status_code, url, resp.get_data().decode('utf-8'))
    return resp


def delete_json(client, url, data):
    resp = client.delete(url, data=json.dumps(data, indent=2), content_type='application/json')
    assert resp.status_code in [200], 'error %d on delete to %s' % (resp.status_code, url)
    return resp


def get_json(client, url):
    """Get json from client."""
    resp = client.get(url, headers={'Accept': 'application/json'})
    assert resp.status_code == 200, \
        'error %d on get to %s:\n%s' % (resp.status_code, url, resp.get_data().decode('utf-8'))
    return json.loads(resp.get_data())


def get_admin_user_id(app):
    from .test_users import ADMIN_USER_ID
    return (get_resource_service('users').find_one(req=None, _id=ADMIN_USER_ID) or {}).get('_id')


def mock_send_email(to, subject, text_body, html_body=None, sender=None, attachments_info=[]):
    if sender is None:
        sender = app.config['MAIL_DEFAULT_SENDER']

    msg = SuperdeskMessage(subject=subject, sender=sender, recipients=to)
    msg.body = text_body
    msg.html = html_body
    msg.attachments = [a['file_name'] for a in attachments_info]

    _app = app._get_current_object()
    with _app.mail.connect() as connection:
        if connection:
            return connection.send(msg)

        return _app.mail.send(msg)
