from flask_mail import Message
from flask import current_app, render_template
from threading import Thread


def send_async_email(app, msg):
    with app.app_context():
        app.mail.send(msg)


def send_email(to, subject, text_body, html_body):
    """
    Sends the email
    :param to: List of recipients
    :param subject: Subject text
    :param text_body: Text Body
    :param html_body: Html Body
    :return:
    """
    msg = Message(subject=subject, sender=current_app.config['MAIL_DEFAULT_SENDER'], recipients=to)
    msg.body = text_body
    msg.html = html_body
    app = current_app._get_current_object()
    thr = Thread(target=send_async_email, args=[app, msg])
    thr.start()
    return thr


def send_validate_account_email(user_name, user_email, token):
    """
    Forms and sends validation email
    :param user_name: Name of the user
    :param user_email: Email address
    :param token: token string
    :return:
    """
    app_name = current_app.config['SITE_NAME']
    url = '{}/validate?token={}'.format(current_app.config['CLIENT_URL'], token)
    hours = current_app.config['VALIDATE_ACCOUNT_TOKEN_TIME_TO_LIVE'] * 24

    subject = '{} account created'.format(app_name)
    text_body = render_template('account_created.txt', app_name=app_name, name=user_name, expires=hours, url=url)
    html_body = render_template('account_created.html', app_name=app_name, name=user_name, expires=hours, url=url)

    send_email(to=[user_email], subject=subject, text_body=text_body, html_body=html_body)
