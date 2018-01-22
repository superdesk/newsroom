import re
import flask
from bson import ObjectId
from flask import jsonify
from flask_babel import gettext
from superdesk import get_resource_service

from newsroom.auth.decorator import admin_only, login_required
from newsroom.cards import blueprint
from newsroom.utils import get_json_or_400, get_entity_or_404
from newsroom.utils import query_resource


@blueprint.route('/cards/settings', methods=['GET'])
@admin_only
def settings():
    data = {
        'products': list(query_resource('products', lookup={'is_enabled': True}, max_results=200)),
        "cards": list(query_resource('cards', max_results=200)),
    }
    return flask.render_template('settings.html', setting_type="cards", data=data)


@blueprint.route('/cards', methods=['GET'])
@login_required
def index():
    cards = list(query_resource('cards', lookup=None, max_results=200))
    return jsonify(cards), 200


@blueprint.route('/cards/search', methods=['GET'])
@admin_only
def search():
    lookup = None
    if flask.request.args.get('q'):
        regex = re.compile('.*{}.*'.format(flask.request.args.get('q')), re.IGNORECASE)
        lookup = {'label': regex}
    products = list(query_resource('cards', lookup=lookup, max_results=200))
    return jsonify(products), 200


@blueprint.route('/cards/new', methods=['POST'])
@admin_only
def create():
    data = get_json_or_400()
    if not data.get('label'):
        return jsonify(gettext('Label not found')), 400

    if not data.get('type'):
        return jsonify(gettext('Type not found')), 400

    ids = get_resource_service('cards').post([data])
    return jsonify({'success': True, '_id': ids[0]}), 201


@blueprint.route('/cards/<id>', methods=['POST'])
@admin_only
def edit(id):
    card = get_entity_or_404(id, 'cards')

    if not card.get('label'):
        return jsonify(gettext('Label not found')), 400

    if not card.get('type'):
        return jsonify(gettext('Type not found')), 400

    data = get_json_or_400()
    updates = {
        'label': data.get('label'),
        'type': data.get('type'),
        'config': data.get('config'),
        'order': data.get('order'),
    }

    get_resource_service('cards').patch(id=ObjectId(id), updates=updates)
    return jsonify({'success': True}), 200


@blueprint.route('/cards/<id>', methods=['DELETE'])
@admin_only
def delete(id):
    """ Deletes the cards by given id """
    get_entity_or_404(id, 'cards')
    get_resource_service('cards').delete({'_id': ObjectId(id)})
    return jsonify({'success': True}), 200
