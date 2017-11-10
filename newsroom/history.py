
import newsroom
import pymongo.errors
import werkzeug.exceptions

from newsroom.auth import get_user
from superdesk.utc import utcnow


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
    def create(self, docs, action, **kwargs):
        now = utcnow()
        user = get_user()

        def transform(item):
            return {
                '_id': '_'.join(map(str, [user['_id'], item['_id'], action])),
                'action': action,
                'created': now,
                'user': user,
                'company': user.get('company'),
                'item': item['_id'],
                'version': item['version'],
            }

        for doc in docs:
            try:
                super().create([transform(doc)])
            except (werkzeug.exceptions.Conflict, pymongo.errors.BulkWriteError):
                continue


def init_app(app):
    newsroom.register_resource('history', HistoryResource, HistoryService, _app=app)
