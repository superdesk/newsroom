import superdesk
from newsroom.news_api.settings import URL_PREFIX
import flask
from superdesk import get_resource_service
from flask import current_app as app, abort
from flask_babel import gettext
from newsroom.news_api.utils import post_api_audit
from newsroom.news_api.api_tokens import CompanyTokenAuth

blueprint = superdesk.Blueprint('news/item', __name__)


@blueprint.route('/{}/news/item/<path:item_id>'.format(URL_PREFIX), methods=['GET'])
def get_item(item_id):
    if CompanyTokenAuth().check_auth(flask.request.headers.get('Authorization'), None, None, 'GET'):
        _format = flask.request.args.get('format', 'NINJSFormatter')
        _version = flask.request.args.get('version')
        service = get_resource_service('formatters')
        formatted = service.get_version(item_id, _version, _format)
        mimetype = formatted.get('mimetype')
        response = app.response_class(response=formatted.get('formatted_item'), status=200, mimetype=mimetype)
        post_api_audit({'_items': [{'_id': item_id}]})
        return response
    else:
        abort(401, gettext('Invalid token'))
