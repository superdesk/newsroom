
import datetime
import newsroom
import superdesk
import pymongo.errors
import werkzeug.exceptions
from html import escape

from bson import ObjectId
from superdesk.utc import utcnow
from flask import current_app as app, session


class NotificationsResource(newsroom.Resource):
    url = 'users/<regex("[a-f0-9]{24}"):user>/notifications'

    resource_methods = ['GET']
    item_methods = ['GET', 'PATCH', 'DELETE']

    schema = {
        '_id': {'type': 'string', 'unique': True},
        'item': newsroom.Resource.rel('items'),
        'user': newsroom.Resource.rel('users'),
        'created': {'type': 'dict', 'nullable': True},
    }

    datasource = {
        'default_sort': [('created', -1)]
    }

    mongo_indexes = {
        'user_created': ([('user', 1), ('created', -1)],),
    }


class NotificationsService(newsroom.Service):
    def create(self, docs):
        now = utcnow()

        for doc in docs:
            id = '_'.join(map(str, [doc['user'], doc['item']]))
            try:
                super().create([{
                    '_id': id,
                    'created': now, 'user': ObjectId(doc['user']), 'item': doc['item']
                }])
            except (werkzeug.exceptions.Conflict, pymongo.errors.BulkWriteError):
                original = super().find_one(req=None, _id=id)
                super().update(id=id, updates={'created': now}, original=original)


def get_user_notifications(user_id):
    ttl = app.config.get('NOTIFICATIONS_TTL', 1)
    lookup = {
        'user': user_id,
        'created': {'$gte': utcnow() - datetime.timedelta(days=ttl)}
    }

    return list(superdesk.get_resource_service('notifications').get(req=None, lookup=lookup))


def get_initial_notifications():
    """
    Returns the stories that user has notifications for
    :return: List of stories
    """
    if not session.get('user'):
        return None

    saved_notifications = get_user_notifications(session['user'])
    item_ids = [n['item'] for n in saved_notifications]
    items = []
    try:
        items.extend(superdesk.get_resource_service('wire_search').get_items(item_ids))
        for item in items:
            item["body_html"] = escape(item["body_html"])
    except KeyError:  # wire disabled
        pass
    try:
        items.extend(superdesk.get_resource_service('agenda').get_items(item_ids))
    except KeyError:  # agenda disabled
        pass
    return {
        'user': str(session['user']) if session['user'] else None,
        'notifications': list(items),
    }
