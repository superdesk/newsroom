
import newsroom
import pymongo.errors
import werkzeug.exceptions

from superdesk.utc import utcnow
from newsroom.utils import query_resource


class HistoryResource(newsroom.Resource):
    item_methods = ['GET']
    resource_methods = ['GET']

    schema = {
        '_id': {type: 'string', 'unique': True},
        'action': {type: 'string'},
        'created': {'type': 'datetime'},
        'user': newsroom.Resource.rel('users'),
        'company': newsroom.Resource.rel('companies'),
        'item': newsroom.Resource.rel('items'),
        'version': {'type': 'string'},
    }

    mongo_indexes = {
        'item': ([('item', 1)], ),
        'company_user': ([('company', 1), ('user', 1)], ),
    }


class HistoryService(newsroom.Service):
    def create(self, docs, action, user, **kwargs):
        now = utcnow()

        def transform(item):
            return {
                '_id': '_'.join(map(str, [user['_id'], item['_id'], action])),
                'action': action,
                'created': now,
                'user': user['_id'],
                'company': user.get('company'),
                'item': item['_id'],
                'version': item['version'],
            }

        for doc in docs:
            try:
                super().create([transform(doc)])
            except (werkzeug.exceptions.Conflict, pymongo.errors.BulkWriteError):
                continue


def get_history_users(item_ids, active_user_ids, active_company_ids):

    lookup = {
        'item': {'$in': item_ids},
        'user': {'$in': active_user_ids},
        'company': {'$in': active_company_ids}
    }

    histories = query_resource('history', lookup=lookup)
    user_matches = [str(h['user']) for h in histories]

    return user_matches


def init_app(app):
    newsroom.register_resource('history', HistoryResource, HistoryService, _app=app)
