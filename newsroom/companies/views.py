import flask
from newsroom.utils import query_resource, find_one
from newsroom.companies import blueprint
from newsroom.companies.forms import CompanyForm
from bson import ObjectId
from werkzeug.exceptions import NotFound
from superdesk import get_resource_service
from flask_babel import gettext
from newsroom.auth.decorator import admin_only, login_required
from flask import jsonify, current_app as app
import re


@blueprint.route('/settings/companies', methods=['GET'])
@admin_only
def settings():
    data = {
        'companies': list(query_resource('companies', max_results=200)),
        'services': app.config['SERVICES'],
        'products': list(query_resource('products', max_results=200)),
    }
    return flask.render_template('settings.html', setting_type="companies", data=data)


@blueprint.route('/companies/search', methods=['GET'])
@admin_only
def search():
    lookup = None
    if flask.request.args.get('q'):
        regex = re.compile('.*{}.*'.format(flask.request.args.get('q')), re.IGNORECASE)
        lookup = {'name': regex}
    companies = list(query_resource('companies', lookup=lookup, max_results=200))
    return jsonify(companies), 200


@blueprint.route('/companies/new', methods=['POST'])
@admin_only
def create():
    form = CompanyForm()
    if form.validate():
        new_company = form.data
        ids = get_resource_service('companies').post([new_company])
        return jsonify({'success': True, '_id': ids[0]}), 201
    return jsonify(form.errors), 400


@blueprint.route('/companies/<id>', methods=['GET', 'POST'])
@admin_only
def edit(id):
    company = find_one('companies', _id=ObjectId(id))

    if not company:
        return NotFound(gettext('Company not found'))

    if flask.request.method == 'POST':
        form = CompanyForm(company=company)
        if form.validate():
            get_resource_service('companies').patch(id=ObjectId(id),
                                                    updates=form.data)
            return jsonify({'success': True}), 200
        return jsonify(form.errors), 400


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
    users = list(query_resource('users', lookup={'company': ObjectId(id)}, max_results=50))
    return jsonify(users), 200
