
import newsroom

from newsroom.auth import get_user
from superdesk.utc import utcnow


class HistoryResource(newsroom.Resource):
    item_methods = ['GET']
    resource_methods = ['GET']

    schema = {
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
                'action': action,
                'created': now,
                'user': user,
                'company': user.get('company'),
                'item': item['_id'],
                'version': item['version'],
            }

        return super().create(list(map(transform, docs)))


def init_app(app):
    newsroom.register_resource('history', HistoryResource, HistoryService, _app=app)
