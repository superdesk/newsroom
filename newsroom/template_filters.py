import os
import arrow
import flask

from eve.utils import str_to_date
from flask_babel import format_time, format_date, format_datetime
from superdesk.text_utils import get_text, get_word_count


def parse_date(datetime):
    """Return datetime instance for datetime."""
    if isinstance(datetime, str):
        try:
            return str_to_date(datetime)
        except ValueError:
            return arrow.get(datetime).datetime
    return datetime


def datetime_short(datetime):
    if datetime:
        return format_datetime(parse_date(datetime), 'short')


def datetime_long(datetime):
    if datetime:
        return format_datetime(parse_date(datetime), "dd/MM/yyyy HH:mm")


def time_short(datetime):
    if datetime:
        return format_time(parse_date(datetime), 'hh:mm')


def date_short(datetime):
    if datetime:
        return format_date(parse_date(datetime), 'short')


def plain_text(html):
    return get_text(html, lf_on_block=True)


def word_count(html):
    return get_word_count(html or '')


def is_admin():
    return flask.session.get('user_type') == 'administrator'


def newsroom_config():
    port = int(os.environ.get('PORT', '5000'))
    return {
        'websocket': os.environ.get('NEWSROOM_WEBSOCKET_URL', 'ws://localhost:%d' % (port + 100, )),
        'time_format': flask.current_app.config['CLIENT_TIME_FORMAT'],
        'date_format': flask.current_app.config['CLIENT_DATE_FORMAT'],
    }
