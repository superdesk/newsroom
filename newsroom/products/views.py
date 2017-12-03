import flask
from newsroom.utils import query_resource, find_one
from newsroom.products import blueprint
from newsroom.products.products import get_sub_products
from bson import ObjectId
from werkzeug.exceptions import NotFound
from superdesk import get_resource_service
from flask_babel import gettext
from newsroom.auth.decorator import admin_only, login_required
from flask import jsonify, current_app as app
from newsroom.utils import get_json_or_400, get_entity_or_404

import re


@blueprint.route('/products', methods=['GET'])
@admin_only
def index():
    lookup = None
    if flask.request.args.get('q'):
        lookup = flask.request.args.get('q')
    products = list(query_resource('products', lookup=lookup, max_results=200))
    return jsonify(products), 200


@blueprint.route('/products/search', methods=['GET'])
@admin_only
def search():
    lookup = None
    if flask.request.args.get('q'):
        regex = re.compile('.*{}.*'.format(flask.request.args.get('q')), re.IGNORECASE)
        lookup = {'name': regex}
    if flask.request.args.get('type'):
        lookup['product_type'] = flask.request.args.get('type')
    products = list(query_resource('products', lookup=lookup, max_results=200))
    return jsonify(products), 200


@blueprint.route('/products/new', methods=['POST'])
@admin_only
def create():
    data = get_json_or_400()
    if not data.get('name'):
        return jsonify(gettext('Name not found')), 400

    if data.get('parents'):
        data['parents'] = [get_entity_or_404(_id, 'products')['_id'] for _id in data.get('parents').split(',')]

    ids = get_resource_service('products').post([data])
    return jsonify({'success': True, '_id': ids[0]}), 201




@blueprint.route('/products/<id>', methods=['POST'])
@admin_only
def edit(id):
    product = get_entity_or_404(id, 'products')

    if not product.get('name'):
        return jsonify(gettext('Name not found')), 400

    data = get_json_or_400()
    updates = {
        'name': data.get('name'),
        'description': data.get('description'),
        'sd_product_id': data.get('sd_product_id'),
        'query': data.get('query'),
        'product_type': data.get('product_type'),

    }
    get_resource_service('products').patch(id=ObjectId(id), updates=updates)
    return jsonify({'success': True}), 200
    return jsonify(form.errors), 400


@blueprint.route('/products/<id>', methods=['DELETE'])
@admin_only
def delete(id):
    """ Deletes the products by given id """
    product = find_one('products', _id=ObjectId(id))
    if product.get('product_type') == 'top_level':
        db = app.data.get_mongo_collection('products')
        # remove all references from sub products
        sub_products = get_sub_products(ObjectId(id))
        for sp in sub_products:
            db.update_one({'_id': sp['_id']}, {'$pull': {'parents': ObjectId(id)}})

    get_resource_service('products').delete({'_id': ObjectId(id)})
    return jsonify({'success': True}), 200