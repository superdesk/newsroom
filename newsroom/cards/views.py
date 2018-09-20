import re
import flask
from bson import ObjectId
from flask import jsonify, json
from flask_babel import gettext
from superdesk import get_resource_service

from newsroom.auth.decorator import admin_only, login_required
from newsroom.cards import blueprint
from newsroom.utils import get_entity_or_404, get_file
from newsroom.utils import query_resource


@blueprint.route('/cards/settings', methods=['GET'])
@admin_only
def settings():
    data = {
        'products': list(query_resource('products', lookup={'is_enabled': True})),
        "cards": list(query_resource('cards')),
    }
    return flask.render_template('settings.html', setting_type="cards", data=data)


@blueprint.route('/cards', methods=['GET'])
@login_required
def index():
    cards = list(query_resource('cards', lookup=None))
    return jsonify(cards), 200


@blueprint.route('/cards/search', methods=['GET'])
@admin_only
def search():
    lookup = None
    if flask.request.args.get('q'):
        regex = re.compile('.*{}.*'.format(flask.request.args.get('q')), re.IGNORECASE)
        lookup = {'label': regex}
    products = list(query_resource('cards', lookup=lookup))
    return jsonify(products), 200


@blueprint.route('/cards/new', methods=['POST'])
@admin_only
def create():
    data = json.loads(flask.request.form['card'])
    card_data = _get_card_data(data)
    ids = get_resource_service('cards').post([card_data])
    return jsonify({'success': True, '_id': ids[0]}), 201


def _get_card_data(data):
    if not data:
        flask.abort(400)

    if not data.get('label'):
        return jsonify(gettext('Label not found')), 400

    if not data.get('type'):
        return jsonify(gettext('Type not found')), 400

    card_data = {
        'label': data.get('label'),
        'type': data.get('type'),
        'config': data.get('config'),
        'order': int(data.get('order', 0) or 0),
    }

    if data.get('type') == '2x2-events':
        for index, event in enumerate(card_data['config']['events']):
            file_url = get_file('file{}'.format(index))
            if file_url:
                event['file_url'] = file_url

    return card_data


@blueprint.route('/cards/<id>', methods=['POST'])
@admin_only
def edit(id):
    get_entity_or_404(id, 'cards')

    data = json.loads(flask.request.form['card'])
    card_data = _get_card_data(data)

    get_resource_service('cards').patch(id=ObjectId(id), updates=card_data)
    return jsonify({'success': True}), 200


@blueprint.route('/cards/<id>', methods=['DELETE'])
@admin_only
def delete(id):
    """ Deletes the cards by given id """
    get_entity_or_404(id, 'cards')
    get_resource_service('cards').delete({'_id': ObjectId(id)})
    return jsonify({'success': True}), 200
