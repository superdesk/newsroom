
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


def get_history_users(item_ids, active_users, active_companies):

    lookup = {'item': {'$in': item_ids}}

    histories = query_resource('history', lookup=lookup, max_results=200)

    user_matches = []
    for history in histories:
        if str(history.get('user', '')) in active_users and str(history.get('company', '')) in active_companies:
            user_matches.append(str(history['user']))

    return user_matches


def init_app(app):
    newsroom.register_resource('history', HistoryResource, HistoryService, _app=app)
