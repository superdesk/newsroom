
import newsroom
import superdesk
import datetime
from bson import ObjectId

from superdesk.utc import utcnow
from flask import current_app as app
import pymongo.errors
import werkzeug.exceptions


class NotificationsResource(newsroom.Resource):
    url = 'users/<regex("[a-f0-9]{24}"):user>/notifications'

    resource_methods = ['GET', 'POST']
    item_methods = ['GET', 'PATCH', 'DELETE']

    schema = {
        '_id': {type: 'string', 'unique': True},
        'item': newsroom.Resource.rel('items'),
        'user': newsroom.Resource.rel('users'),
        'created': {'type': 'dict', 'nullable': True},
    }

    datasource = {
        'default_sort': [('_created', -1)]
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
        '_created': {'$gte': utcnow() - datetime.timedelta(days=ttl)}
    }

    return list(superdesk.get_resource_service('notifications').get(req=None, lookup=lookup))
