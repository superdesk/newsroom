import pytz
from flask import request, current_app as app
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from newsroom.auth import get_user_id


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


def update_action_list(items, action_list, force_insert=False, item_type='items'):
    """
    Stores user id into array of action_list of an item
    :param items: items to be updated
    :param action_list: field name of the list
    :param force_insert: inserts into list regardless of the http method
    :param item_type: either items or agenda as the collection
    :return:
    """
    user_id = get_user_id()
    if user_id:
        db = app.data.get_mongo_collection(item_type)
        elastic = app.data._search_backend(item_type)
        if request.method == 'POST' or force_insert:
            updates = {'$addToSet': {action_list: user_id}}
        else:
            updates = {'$pull': {action_list: user_id}}
        for item_id in items:
            result = db.update_one({'_id': item_id}, updates)
            if result.modified_count:
                modified = db.find_one({'_id': item_id})
                elastic.update(item_type, item_id, {action_list: modified[action_list]})
