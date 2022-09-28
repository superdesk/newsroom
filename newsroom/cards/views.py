import re
import flask
from bson import ObjectId
from flask import jsonify, json, current_app as app
from flask_babel import gettext
from superdesk import get_resource_service

from newsroom.decorator import admin_only, login_required
from newsroom.cards import blueprint
from newsroom.utils import get_entity_or_404, query_resource, set_original_creator, set_version_creator,\
    clean_navigation, clean_product, clean_card, is_safe_string
from newsroom.upload import get_file


def get_settings_data():
    return {
        'products': [clean_product(product) for product in query_resource('products', lookup={'is_enabled': True})],
        'cards': [clean_card(card) for card in query_resource('cards')],
        'dashboards': app.dashboards,
        'navigations': [clean_navigation(navigation) for navigation in query_resource('navigations',
                                                                                      lookup={'is_enabled': True})]
    }


@blueprint.route('/cards', methods=['GET'])
@login_required
def index():
    cards = [clean_card(card) for card in query_resource('cards')]
    return jsonify(cards), 200


@blueprint.route('/cards/search', methods=['GET'])
@admin_only
def search():
    lookup = None
    if flask.request.args.get('q'):
        regex = re.compile('.*{}.*'.format(flask.request.args.get('q')), re.IGNORECASE)
        lookup = {'label': regex}
    cards = [clean_card(card) for card in query_resource('cards', lookup=lookup)]
    return jsonify(cards), 200


@blueprint.route('/cards/new', methods=['POST'])
@admin_only
def create():
    data = json.loads(flask.request.form['card'])
    card_data = _get_card_data(data)
    set_original_creator(card_data)

    errors = _validate_card(card_data)
    if errors:
        return errors

    ids = get_resource_service('cards').post([card_data])
    return jsonify({'success': True, '_id': ids[0]}), 201


def _validate_card(data):

    if not data.get('label'):
        return jsonify({'label': gettext('Label not found')}), 400

    if not is_safe_string(data.get('label')):
        return jsonify({'label': gettext('Illegal Character')}), 400

    if not is_safe_string(data.get('dashboard')):
        return jsonify({'dashboard': gettext('Illegal Character')}), 400

    if not is_safe_string(data.get('type')):
        return jsonify({'type': gettext('Illegal Character')}), 400


def _get_card_data(data):
    if not data:
        flask.abort(400)

    if not data.get('type'):
        raise ValueError(gettext('Type not found'))

    if data.get('dashboard') and data['dashboard'] not in {d['_id'] for d in app.dashboards}:
        raise ValueError(gettext('Dashboard type not found'))

    card_data = {
        'label': data.get('label'),
        'type': data.get('type'),
        'dashboard': data.get('dashboard', 'newsroom'),
        'config': data.get('config'),
        'order': int(data.get('order', 0) or 0),
    }

    if data.get('type') == '2x2-events':
        for index, event in enumerate(card_data['config']['events']):
            file_url = get_file('file{}'.format(index))
            if file_url:
                event['file_url'] = file_url

    if data.get('type') == '4-photo-gallery':
        for source in (data.get('config') or {}).get('sources'):
            if source.get("url") and source.get("count"):
                source['count'] = int(source.get("count")) if source.get('count') else source.get('count')
            else:
                source.pop('url', None)
                source.pop('count', None)

    return card_data


@blueprint.route('/cards/<id>', methods=['POST'])
@admin_only
def edit(id):
    get_entity_or_404(id, 'cards')

    data = json.loads(flask.request.form['card'])
    card_data = _get_card_data(data)
    set_version_creator(card_data)

    errors = _validate_card(card_data)
    if errors:
        return errors

    get_resource_service('cards').patch(id=ObjectId(id), updates=card_data)
    return jsonify({'success': True}), 200


@blueprint.route('/cards/<id>', methods=['DELETE'])
@admin_only
def delete(id):
    """ Deletes the cards by given id """
    get_entity_or_404(id, 'cards')
    get_resource_service('cards').delete({'_id': ObjectId(id)})
    return jsonify({'success': True}), 200
