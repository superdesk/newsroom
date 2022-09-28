from flask import request, current_app as app
from newsroom.auth import get_user_id
from newsroom.utils import is_safe_string, gettext


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
        return picture.get('description_text') or picture.get('body_text')


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


def validate_news_only_filter(value):
    if not is_safe_string(value):
        return gettext("Invalid character in News only filter")
