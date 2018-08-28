from flask import current_app, render_template, url_for
from flask_babel import gettext

from newsroom.email import send_email


def send_coverage_notification_email(user, agenda, wire_item):
    if user.get('receive_email'):
        send_email(
            to=[user['email']],
            subject=gettext('New coverage'),
            text_body=render_template('agenda_new_coverage_email.txt', agenda=agenda, item=wire_item),
            html_body=render_template('agenda_new_coverage_email.html', agenda=agenda, item=wire_item)
        )


def send_coverage_request_email(user, message, item):
    """
    Forms and sends coverage request email
    :param user: User that makes the request
    :param message: Request message
    :param item: agenda item that request is made against
    :return:
    """
    recipients = current_app.config['COVERAGE_REQUEST_RECIPIENTS'].split(',')
    assert recipients
    assert isinstance(recipients, list)
    url = url_for('agenda.item', _id=item, _external=True)
    name = '{} {}'.format(user.get('first_name'), user.get('last_name'))
    email = user.get('email')

    subject = gettext('A new coverage request')
    text_body = render_template('coverage_request_email.txt', name=name, email=email,
                                message=message, url=url)
    html_body = render_template('coverage_request_email.html', name=name, email=email,
                                message=message, url=url)

    send_email(to=recipients, subject=subject, text_body=text_body, html_body=html_body)
