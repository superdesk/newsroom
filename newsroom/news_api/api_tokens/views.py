import logging
import flask
from flask import jsonify
from newsroom.news_api.api_tokens import blueprint
from superdesk import get_resource_service
from newsroom.utils import get_json_or_400
from content_api.errors import BadParameterValueError
from superdesk.json_utils import loads
import json
from . import API_TOKENS

logger = logging.getLogger(__name__)


@blueprint.route('/news_api_tokens', methods=['POST'])
def create():
    try:
        data = loads(json.dumps(get_json_or_400()))
        new_token = get_resource_service(API_TOKENS).post([data])
        return jsonify({'token': new_token[0]}), 201
    except BadParameterValueError:
        return jsonify({'error': 'Bad request'}), 400
    except Exception as ex:
        return jsonify({'error': ex}), 500


@blueprint.route('/news_api_tokens', methods=['PATCH'])
def update():
    token = flask.request.args.get('token')
    try:
        data = loads(json.dumps(get_json_or_400()))
        return jsonify(get_resource_service(API_TOKENS).patch(token, data)), 200
    except Exception as ex:
        return jsonify({'error': ex}), 500


@blueprint.route('/news_api_tokens', methods=['DELETE'])
def delete():
    company = flask.request.args.get('company')
    try:
        token = get_resource_service(API_TOKENS).find_one(req=None, company=company)
        if token and token.get('token'):
            get_resource_service(API_TOKENS).delete({'_id': token['token']})
            return jsonify({'success': True}), 200
        else:
            return jsonify({'error': 'Not Found'}), 404
    except Exception as ex:
        return jsonify({'error': ex}), 500


@blueprint.route('/news_api_tokens', methods=['GET'])
def get():
    company = flask.request.args.get('company')
    data = get_resource_service(API_TOKENS).find_one(req=None, company=company)
    if data:
        return jsonify(data), 200
    else:
        return jsonify({'error': 'Not Found'}), 404
