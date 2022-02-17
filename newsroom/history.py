
import newsroom
import pymongo.errors
import werkzeug.exceptions

from superdesk import get_resource_service
from superdesk.resource import not_analyzed, not_enabled
from superdesk.utc import utcnow
from flask import json, abort, Blueprint, jsonify
from flask_babel import gettext
from eve.utils import ParsedRequest
from newsroom.utils import get_json_or_400
from newsroom.auth import get_user

blueprint = Blueprint('history', __name__)


class HistoryResource(newsroom.Resource):
    item_methods = ['GET']
    resource_methods = ['GET']

    schema = {
        '_id': {'type': 'string', 'unique': True},
        'action': {'type': 'string'},
        'versioncreated': {'type': 'datetime'},
        'user': newsroom.Resource.rel('users'),
        'company': newsroom.Resource.rel('companies'),
        'item': {
            'type': 'string',
            'mapping': not_analyzed
        },
        'version': {'type': 'string'},
        'section': {
            'type': 'string',
            'mapping': not_analyzed
        },
        # reference to a monitoring profile if relevant
        'monitoring': {
            'type': 'string',
            'mapping': not_analyzed,
            'required': False
        },
        'extra_data': {
            'type': 'object',
            'mapping': not_enabled
        }
    }

    mongo_indexes = {
        'item': ([('item', 1)], ),
        'company_user': ([('company', 1), ('user', 1)], ),
    }

    datasource = {
        'source': 'history',
        'search_backend': 'elastic'
    }


class HistoryService(newsroom.Service):
    def create(self, docs, action, user, section='wire', monitoring=None, **kwargs):
        now = utcnow()

        def transform(item):
            return {
                'action': action,
                'versioncreated': now,
                'user': user['_id'],
                'company': user.get('company'),
                'item': item['_id'],
                'version': item.get('version') if item.get('version') else item.get('_current_version', ''),
                'section': section,
                'monitoring': monitoring,
            }

        for doc in docs:
            try:
                super().create([transform(doc)])
            except (werkzeug.exceptions.Conflict, pymongo.errors.BulkWriteError):
                continue

    def create_history_record(self, items, action, user, section, monitoring=None):
        self.create(items, action, user, section, monitoring)

    def query_items(self, query):
        if query['from'] >= 1000:
            # https://www.elastic.co/guide/en/elasticsearch/guide/current/pagination.html#pagination
            return abort(400)

        req = ParsedRequest()
        req.args = {'source': json.dumps(query)}
        return super().get(req, None)

    def fetch_history(self, query, all=False):
        results = self.query_items(query)
        docs = results.docs
        if all:
            while results.hits['hits']['total'] > len(docs):
                query['from'] = len(docs)
                results = self.query_items(query)
                docs.extend(results.docs)

        return {
            'items': docs,
            'hits': results.hits
        }


def get_history_users(item_ids, active_user_ids, active_company_ids, section, action):
    source = {
        'query': {
            'bool': {
                'must': [
                    {'terms': {'company': [str(a) for a in active_company_ids]}},
                    {'terms': {'item': [str(i) for i in item_ids]}},
                    {'term': {'section': section}},
                    {'term': {'action': action}},
                ]
            }
        },
        'size': 25,
        'from': 0
    }

    # Get the results
    histories = get_resource_service('history').fetch_history(source, all=True).get('items') or []

    # Filter out the users
    user_ids = [str(uid) for uid in active_user_ids]
    return [
        str(h['user'])
        for h in histories
        if h.get('user') in user_ids
    ]


@blueprint.route('/history/new', methods=['POST'])
def create():
    params = get_json_or_400()
    if not params.get('item') or not params.get('action') or not params.get('section'):
        return "", gettext('Activity History: Inavlid request')

    get_resource_service('history').create_history_record([params['item']],
                                                          params['action'],
                                                          get_user(),
                                                          params['section'])
    return jsonify({'success': True}), 201


def init_app(app):
    newsroom.register_resource('history', HistoryResource, HistoryService, _app=app)
