import os

from flask_babel import format_time, format_date, format_datetime
from superdesk.text_utils import get_text, get_word_count


def datetime_short(datetime):
    if datetime:
        return format_datetime(datetime, 'short')


def datetime_long(datetime):
    if datetime:
        return format_datetime(datetime, "dd/MM/yyyy HH:mm")


def time_short(datetime):
    return format_time(datetime, 'hh:mm')


def date_short(datetime):
    return format_date(datetime, 'short')


def plain_text(html):
    return get_text(html, lf_on_block=True)


def word_count(html):
    return get_word_count(html or '')


def newsroom_config():
    port = int(os.environ.get('PORT', '5000'))
    return {
        'websocket': os.environ.get('NEWSROOM_WEBSOCKET_URL', 'ws://localhost:%d' % (port + 100, )),
    }


def get_picture(item):
    return item.get('associations', {}).get('featuremedia')
