import flask
from newsroom.utils import query_resource, find_one, json_serialize_datetime_objectId
from newsroom.companies import blueprint
from newsroom.companies.forms import CompanyForm
from bson import ObjectId
from werkzeug.exceptions import NotFound
from superdesk import get_resource_service
from flask_babel import gettext
from newsroom.auth.decorator import admin_only
import json


@blueprint.route('/companies', methods=['GET'])
@admin_only
def index():
    companies = list(query_resource('companies', max_results=50))
    return flask.render_template(
        'companies.html',
        companies=companies)


@blueprint.route('/companies/search', methods=['GET'])
@admin_only
def search():
    companies = list(query_resource('companies', max_results=50))
    response = flask.current_app.response_class(
        response=json.dumps(companies, default=json_serialize_datetime_objectId),
        status=200,
        mimetype='application/json'
    )
    return response


@blueprint.route('/companies/new', methods=['POST'])
@admin_only
def create():
    form = CompanyForm()
    if form.validate():
        new_company = form.data
        get_resource_service('companies').post([new_company])
        return json.dumps({'success': True}), 201, {'ContentType': 'application/json'}
    return json.dumps(form.errors), 400, {'ContentType': 'application/json'}


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
            return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}
        return json.dumps(form.errors), 400, {'ContentType': 'application/json'}


@blueprint.route('/companies/<id>', methods=['DELETE'])
@admin_only
def delete(id):
    """
    Deletes the company and users of the company with given company id
    """
    get_resource_service('users').delete(lookup={'company': ObjectId(id)})
    get_resource_service('companies').delete({'_id': ObjectId(id)})
    return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}
