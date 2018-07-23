import re
import flask
from bson import ObjectId
from flask import jsonify, current_app as app
from flask_babel import gettext
from superdesk import get_resource_service

from newsroom.auth.decorator import admin_only
from newsroom.navigations import blueprint
from newsroom.products.products import get_products_by_navigation
from newsroom.utils import get_json_or_400, get_entity_or_404
from newsroom.utils import query_resource


@blueprint.route('/navigations/settings', methods=['GET'])
@admin_only
def settings():
    data = {
        'products': list(query_resource('products')),
        "navigations": list(query_resource('navigations')),
    }
    return flask.render_template('settings.html', setting_type="navigations", data=data)


@blueprint.route('/navigations', methods=['GET'])
def index():
    navigations = list(query_resource('navigations', lookup=None))
    return jsonify(navigations), 200


@blueprint.route('/navigations/search', methods=['GET'])
@admin_only
def search():
    lookup = None
    if flask.request.args.get('q'):
        regex = re.compile('.*{}.*'.format(flask.request.args.get('q')), re.IGNORECASE)
        lookup = {'name': regex}
    products = list(query_resource('navigations', lookup=lookup))
    return jsonify(products), 200


@blueprint.route('/navigations/new', methods=['POST'])
@admin_only
def create():
    data = get_json_or_400()
    if not data.get('name'):
        return jsonify(gettext('Name not found')), 400

    ids = get_resource_service('navigations').post([data])
    return jsonify({'success': True, '_id': ids[0]}), 201


@blueprint.route('/navigations/<id>', methods=['POST'])
@admin_only
def edit(id):
    navigation = get_entity_or_404(id, 'navigations')

    if not navigation.get('name'):
        return jsonify(gettext('Name not found')), 400

    data = get_json_or_400()
    updates = {
        'name': data.get('name'),
        'description': data.get('description'),
        'is_enabled': data.get('is_enabled'),
    }

    get_resource_service('navigations').patch(id=ObjectId(id), updates=updates)
    return jsonify({'success': True}), 200


@blueprint.route('/navigations/<id>', methods=['DELETE'])
@admin_only
def delete(id):
    """ Deletes the navigations by given id """
    get_entity_or_404(id, 'navigations')

    # remove all references from products
    db = app.data.get_mongo_collection('products')
    products = get_products_by_navigation(id)
    for product in products:
        db.update_one({'_id': product['_id']}, {'$pull': {'navigations': id}})

    get_resource_service('navigations').delete({'_id': ObjectId(id)})
    return jsonify({'success': True}), 200


@blueprint.route('/navigations/<id>/products', methods=['POST'])
@admin_only
def save_navigation_products(id):
    get_entity_or_404(id, 'navigations')
    data = get_json_or_400()
    products = list(query_resource('products'))

    db = app.data.get_mongo_collection('products')
    for product in products:
        if str(product['_id']) in data.get('products', []):
            db.update_one({'_id': product['_id']}, {'$addToSet': {'navigations': id}})
        else:
            db.update_one({'_id': product['_id']}, {'$pull': {'navigations': id}})

    return jsonify(), 200
