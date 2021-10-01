import superdesk
import flask
from superdesk import get_resource_service
from flask import current_app as app, abort, g
from flask_babel import gettext
from newsroom.news_api.utils import post_api_audit
from bson import ObjectId

blueprint = superdesk.Blueprint('news/item', __name__)


def init_app(app):
    superdesk.blueprint(blueprint, app)


@blueprint.route('/news/item/<path:item_id>', methods=['GET'])
def get_item(item_id):
    auth = app.auth
    if not auth.authorized([], None, flask.request.method):
        return abort(401, gettext('Invalid token'))

    _format = flask.request.args.get('format', 'NINJSFormatter')
    _version = flask.request.args.get('version')
    service = get_resource_service('formatters')
    formatted = service.get_version(item_id, _version, _format)
    mimetype = formatted.get('mimetype')
    response = app.response_class(response=formatted.get('formatted_item'), status=200, mimetype=mimetype)

    post_api_audit({'_items': [{'_id': item_id}]})
    # Record the retrieval of the item in the history collection
    get_resource_service('history').create_history_record([{'_id': item_id, 'version': formatted.get('version')}],
                                                          'api', {'_id': None,
                                                                  'company': ObjectId(g.user)}, 'news_api')
    return response
