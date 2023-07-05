
import newsroom
import pymongo.errors
import werkzeug.exceptions
from bson import ObjectId

from superdesk import get_resource_service
from superdesk.resource import not_analyzed, not_enabled
from superdesk.utc import utcnow
from flask import json, abort, Blueprint, jsonify, g
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

    def create_media_history_record(self, item, association_name, action, user, section):
        """
        Log the download of an association belonging to an item
        :param item:
        :param association_name:
        :param action:
        :param user:
        :param section:
        :return:
        """
        now = utcnow()
        if action is None:
            action = "media"
        entry = {
            'action': action,
            'versioncreated': now,
            'user': user.get('_id', None),
            'company': user.get('company', None),
            'item': item.get('_id'),
            'version': item.get('version') if item.get('version') else item.get('_current_version', ''),
            'section': section,
            'extra_data': association_name
        }
        try:
            super().create([entry])
        except (werkzeug.exceptions.Conflict, pymongo.errors.BulkWriteError):
            pass

    def log_media_download(self, item_id, media_id):
        """
        Given am item, media reference and a user record the download
        :param item:
        :param media:
        :return:
        """
        user = get_user(required=True)
        item = get_resource_service('items').find_one(req=None, _id=item_id)
        if not item:
            abort(404)

        found = False
        # Find the matching media in the item
        for name, association in (item.get('associations') or {}).items():
            for rendition in item.get("associations").get(name).get("renditions"):
                if association.get('renditions').get(rendition).get('media') == media_id:
                    found = True
                    break
            if found:
                break
        if not found:
            abort(404)
        action = 'download ' + association.get('type')
        self.create_media_history_record(item, name, action, user, 'wire')

    def log_api_media_download(self, item_id, media_id):
        """
        Given am item, media reference and a user record the download
        :param item:
        :param media:
        :return:
        """
        item = get_resource_service('items').find_one(req=None, _id=item_id)
        if not item:
            abort(404)

        found = False
        # Find the matching media in the item
        for name, association in (item.get('associations') or {}).items():
            for rendition in item.get("associations").get(name).get("renditions"):
                if association.get('renditions').get(rendition).get('media') == media_id:
                    found = True
                    break
            if found:
                break
        if not found:
            abort(404)
        action = 'download ' + association.get('type')
        self.create_media_history_record(item, name, action, {'_id': None, 'company': ObjectId(g.user)}, 'news_api')

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
