import pytz
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta


def get_picture(item):
    if item['type'] == 'picture':
        return item
    return item.get('associations', {}).get('featuremedia', get_body_picture(item))


def get_body_picture(item):
    pictures = [assoc for assoc in item.get('associations', {}).values() if assoc.get('type') == 'picture']
    if pictures:
        return pictures[0]


def get_caption(picture):
    if picture:
        return picture.get('body_text', picture.get('description_text'))


def get_utcnow():
    """ added for unit tests """
    return datetime.utcnow()


def today(time, offset):
    user_local_date = get_utcnow() - timedelta(minutes=offset)
    local_start_date = datetime.strptime('%sT%s' % (user_local_date.strftime('%Y-%m-%d'), time),
                                         '%Y-%m-%dT%H:%M:%S')
    return local_start_date


def format_date(date, time, offset):
    if date == 'now/d':
        return today(time, offset)
    if date == 'now/w':
        _today = today(time, offset)
        monday = _today - timedelta(days=_today.weekday())
        return monday
    if date == 'now/M':
        month = today(time, offset).replace(day=1)
        return month
    return datetime.strptime('%sT%s' % (date, time), '%Y-%m-%dT%H:%M:%S')


def get_local_date(date, time, offset):
    local_dt = format_date(date, time, offset)
    return pytz.utc.normalize(local_dt.replace(tzinfo=pytz.utc) + timedelta(minutes=offset))


def get_end_date(date_range, start_date):
    if date_range == 'now/d':
        return start_date
    if date_range == 'now/w':
        return start_date + timedelta(days=6)
    if date_range == 'now/M':
        return start_date + relativedelta(months=+1) - timedelta(days=1)
    return start_date
