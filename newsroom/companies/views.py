import re
from datetime import datetime

import flask
from bson import ObjectId
from flask import jsonify, current_app as app
from flask_babel import gettext
from superdesk import get_resource_service
from werkzeug.exceptions import NotFound

from newsroom.auth.decorator import admin_only, login_required
from newsroom.companies import blueprint
from newsroom.utils import query_resource, find_one, get_entity_or_404, get_json_or_400


def get_settings_data():
    return {
        'companies': list(query_resource('companies')),
        'services': app.config['SERVICES'],
        'products': list(query_resource('products')),
        'sections': app.sections,
    }


@blueprint.route('/companies/search', methods=['GET'])
@admin_only
def search():
    lookup = None
    if flask.request.args.get('q'):
        regex = re.compile('.*{}.*'.format(flask.request.args.get('q')), re.IGNORECASE)
        lookup = {'name': regex}
    companies = list(query_resource('companies', lookup=lookup))
    return jsonify(companies), 200


@blueprint.route('/companies/new', methods=['POST'])
@admin_only
def create():
    company = get_json_or_400()
    validate_company(company)
    new_company = get_company_updates(company)
    ids = get_resource_service('companies').post([new_company])
    return jsonify({'success': True, '_id': ids[0]}), 201


def validate_company(company):
    if not company.get('name'):
        return jsonify({'name': gettext('Name not found')}), 400

    if company.get('expiry_date'):
        try:
            datetime.strptime(company.get('expiry_date'), '%Y-%m-%d')
        except ValueError:
            return jsonify({'expiry_date': gettext('Wrong date format')}), 400


def get_company_updates(company):
    updates = {
        'name': company.get('name'),
        'url': company.get('url'),
        'sd_subscriber_id': company.get('sd_subscriber_id'),
        'contact_name': company.get('contact_name'),
        'contact_email': company.get('contact_email'),
        'phone': company.get('phone'),
        'country': company.get('country'),
        'is_enabled': company.get('is_enabled'),
    }

    if company.get('expiry_date'):
        updates['expiry_date'] = datetime.strptime(str(company.get('expiry_date'))[:10], '%Y-%m-%d')
    else:
        updates['expiry_date'] = None

    return updates


@blueprint.route('/companies/<id>', methods=['GET', 'POST'])
@admin_only
def edit(id):
    company = find_one('companies', _id=ObjectId(id))

    if not company:
        return NotFound(gettext('Company not found'))

    if flask.request.method == 'POST':
        company = get_json_or_400()
        validate_company(company)
        updates = get_company_updates(company)

        get_resource_service('companies').patch(id=ObjectId(id), updates=updates)
        return jsonify({'success': True}), 200
    return jsonify(company), 200


@blueprint.route('/companies/<id>', methods=['DELETE'])
@admin_only
def delete(id):
    """
    Deletes the company and users of the company with given company id
    """
    get_resource_service('users').delete(lookup={'company': ObjectId(id)})
    get_resource_service('companies').delete({'_id': ObjectId(id)})
    return jsonify({'success': True}), 200


@blueprint.route('/companies/<id>/users', methods=['GET'])
@login_required
def company_users(id):
    """TODO(petr): use projection to hide fields like token/email."""
    users = list(query_resource('users', lookup={'company': ObjectId(id)}))
    return jsonify(users), 200


def update_products(updates, company_id):
    products = list(query_resource('products'))
    db = app.data.get_mongo_collection('products')
    for product in products:
        if updates.get(str(product['_id'])):
            db.update_one({'_id': product['_id']}, {'$addToSet': {'companies': company_id}})
        else:
            db.update_one({'_id': product['_id']}, {'$pull': {'companies': company_id}})


def update_sections(sections, _id):
    get_resource_service('companies').patch(_id, updates={'sections': sections})


@blueprint.route('/companies/<id>/permissions', methods=['POST'])
@admin_only
def save_company_permissions(id):
    orig = get_entity_or_404(id, 'companies')
    data = get_json_or_400()
    update_products(data['products'], id)
    update_sections(data['sections'], orig['_id'])
    return jsonify(), 200
