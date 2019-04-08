from newsroom.email import send_new_item_notification_email
from flask import render_template_string, json, url_for


def test_item_notification_template(client, app, mocker):
    user = {'email': 'foo@example.com'}
    item = {
        '_id': 'tag:localhost:2018:bcc9fd45',
        'guid': 'tag:localhost:2018:bcc9fd45',
        'versioncreated': json.loads('{"date": "2018-07-02T09:15:48+0000"}')['date'],
        'slugline': 'Albion Park Greys',
        'headline': 'Albion Park Greyhound VIC TAB DIVS 1-2 Monday',
        'service': [
            {'name': 'Racing'},
        ],
        'body_html': '<p>HTML Body</p>',
        'type': 'text',
    }

    item_url = url_for('wire.wire', item=item['_id'], _external=True)

    sub = mocker.patch('newsroom.email.send_email')

    with app.app_context():
        send_new_item_notification_email(user, 'Topic', item)

    sub.assert_called_with(
        to=[user['email']],
        subject='New story for followed topic: Topic',
        text_body=render_template_string("""
{% extends "new_item_notification.txt" %}
{% block content %}Albion Park Greyhound VIC TAB DIVS 1-2 Monday

HTML Body


Slugline: Albion Park Greys
Headline: Albion Park Greyhound VIC TAB DIVS 1-2 Monday
Category: Racing
Published: 02/07/2018 11:15
Link: {{ item_url }}

{% endblock %}
""", app_name=app.config['SITE_NAME'], item_url=item_url),
        html_body=render_template_string("""
{% extends "new_item_notification.html" %}
{% block content %}<h1>Albion Park Greyhound VIC TAB DIVS 1-2 Monday</h1>

<p>HTML Body</p>

<dl>
<dt>Slugline:</dt><dd>Albion Park Greys</dd>
<dt>Headline:</dt><dd>Albion Park Greyhound VIC TAB DIVS 1-2 Monday</dd>
<dt>Category:</dt><dd>Racing</dd>
<dt>Published:</dt><dd>02/07/2018 11:15</dd>
<dt>Link:</dt><dd><a href="{{ item_url }}">{{ item_url }}</a></dd>
</dl>

{% endblock %}
""", app_name=app.config['SITE_NAME'], item_url=item_url))
