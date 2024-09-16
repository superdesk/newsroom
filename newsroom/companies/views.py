import re
from datetime import datetime

import flask
from bson import ObjectId
from flask import current_app as app
from flask_babel import gettext
from superdesk import get_resource_service
from werkzeug.exceptions import NotFound

from newsroom.decorator import admin_only, account_manager_only, login_required
from newsroom.companies import blueprint
from newsroom.utils import query_resource, find_one, get_entity_or_404, get_json_or_400, set_original_creator, \
    set_version_creator
import ipaddress
from flask import request, jsonify, current_app, session
import secrets


def get_company_types_options(company_types):
    return [
        dict([(k, v) for k, v in company_type.items() if k in {'id', 'name'}])
        for company_type in company_types
    ]


def get_settings_data():
    return {
        'companies': list(query_resource('companies')),
        'services': app.config['SERVICES'],
        'products': list(query_resource('products')),
        'sections': app.sections,
        'company_types': get_company_types_options(app.config.get('COMPANY_TYPES', [])),
        'api_enabled': app.config.get('NEWS_API_ENABLED', False),
        'ui_config': get_resource_service('ui_config').getSectionConfig('companies'),
    }


@blueprint.route('/companies/search', methods=['GET'])
@account_manager_only
def search():
    lookup = None
    if flask.request.args.get('q'):
        regex = re.compile('.*{}.*'.format(flask.request.args.get('q')), re.IGNORECASE)
        lookup = {'name': regex}
    companies = list(query_resource('companies', lookup=lookup))
    return jsonify(companies), 200


@blueprint.route('/companies/new', methods=['POST'])
@account_manager_only
def create():
    company = get_json_or_400()
    errors = get_errors_company(company)
    if errors:
        return errors

    new_company = get_company_updates(company)
    set_original_creator(new_company)
    ids = get_resource_service('companies').post([new_company])
    return jsonify({'success': True, '_id': ids[0]}), 201


def get_errors_company(company):
    if not company.get('name'):
        return jsonify({'name': gettext('Name not found')}), 400

    if company.get('allowed_ip_list'):
        errors = []
        for ip in company['allowed_ip_list']:
            try:
                ipaddress.ip_network(ip, strict=False)
            except ValueError as e:
                errors.append(gettext('{0}: {1}'.format(ip, e)))

        if errors:
            return jsonify({'allowed_ip_list': errors}), 400


def get_company_updates(company):
    updates = {
        'name': company.get('name'),
        'url': company.get('url'),
        'sd_subscriber_id': company.get('sd_subscriber_id'),
        'account_manager': company.get('account_manager'),
        'contact_name': company.get('contact_name'),
        'contact_email': company.get('contact_email'),
        'phone': company.get('phone'),
        'country': company.get('country'),
        'is_enabled': company.get('is_enabled'),
        'company_type': company.get('company_type'),
        'monitoring_administrator': company.get('monitoring_administrator'),
        'allowed_ip_list': company.get('allowed_ip_list'),
    }

    if company.get('expiry_date'):
        updates['expiry_date'] = datetime.strptime(str(company.get('expiry_date'))[:10], '%Y-%m-%d')
    else:
        updates['expiry_date'] = None

    return updates


@blueprint.route('/companies/<_id>', methods=['GET', 'POST'])
@account_manager_only
def edit(_id):
    company = find_one('companies', _id=ObjectId(_id))

    if not company:
        return NotFound(gettext('Company not found'))

    if flask.request.method == 'POST':
        company = get_json_or_400()
        errors = get_errors_company(company)
        if errors:
            return errors

        updates = get_company_updates(company)
        set_version_creator(updates)
        get_resource_service('companies').patch(ObjectId(_id), updates=updates)
        app.cache.delete(_id)
        return jsonify({'success': True}), 200
    return jsonify(company), 200


@blueprint.route('/companies/<_id>', methods=['DELETE'])
@admin_only
def delete(_id):
    """
    Deletes the company and users of the company with given company id
    """
    get_resource_service('users').delete_action(lookup={'company': ObjectId(_id)})
    get_resource_service('companies').delete_action(lookup={'_id': ObjectId(_id)})

    app.cache.delete(_id)
    return jsonify({'success': True}), 200


@blueprint.route('/companies/<_id>/users', methods=['GET'])
@login_required
def company_users(_id):
    """TODO(petr): use projection to hide fields like token/email."""
    users = list(query_resource('users', lookup={'company': ObjectId(_id)}))
    return jsonify(users), 200


def update_products(updates, company_id):
    products = list(query_resource('products'))
    db = app.data.get_mongo_collection('products')
    for product in products:
        if updates.get(str(product['_id'])):
            db.update_one({'_id': product['_id']}, {'$addToSet': {'companies': company_id}})
        else:
            db.update_one({'_id': product['_id']}, {'$pull': {'companies': company_id}})


def update_company(data, _id):
    updates = {k: v for k, v in data.items() if k in ('sections', 'archive_access', 'events_only')}

    embedded_fields = [
        'video_display', 'audio_display', 'social_media_display', 'images_display', 'sdpermit_display', 'all_display',
        'social_media_download', 'video_download', 'audio_download', 'images_download', 'sdpermit_download',
        'all_download'
    ]

    if 'embedded' in data:
        embedded_updates = {k: v for k, v in data['embedded'].items() if k in embedded_fields}
        if embedded_updates:
            updates['embedded'] = embedded_updates

    get_resource_service('companies').patch(_id, updates=updates)


@blueprint.route('/companies/<_id>/permissions', methods=['POST'])
@account_manager_only
def save_company_permissions(_id):
    csrf_token = request.headers.get('X-CSRF-Token')
    expected_csrf_token = session.pop('csrf_token')
    orig = get_entity_or_404(_id, 'companies')
    data = get_json_or_400()
    if not csrf_token or csrf_token != expected_csrf_token:
        current_app.logger.error("Permisson CSRF validation failed:")
        return jsonify({"error": "Permisson CSRF token validation failed"}), 403

    try:
        update_products(data['products'], _id)
        update_company(data, orig['_id'])
    except Exception as e:
        current_app.logger.error(f"Error updating company permissions: {str(e)}")
        return jsonify({"error": "An error occurred while updating permissions"}), 500

    return jsonify({"message": "Permissions updated successfully"}), 200


@blueprint.route('/companies/get-csrf-token', methods=['GET'])
@account_manager_only
def get_csrf_token():
    csrf_token = secrets.token_hex(32)
    session['csrf_token'] = csrf_token
    return jsonify({'csrf_token': csrf_token})
