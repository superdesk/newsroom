import flask
from newsroom.utils import query_resource, find_one
from newsroom.companies import blueprint
from newsroom.companies.forms import CompanyForm
from bson import ObjectId
from werkzeug.exceptions import BadRequest
from superdesk import get_resource_service
from flask_babel import gettext
from newsroom.auth.decorator import admin_only


@blueprint.route('/companies', methods=['GET'])
@admin_only
def index():
    companies = list(query_resource('companies', max_results=50))
    return flask.render_template(
        'companies.html',
        companies=companies)


@blueprint.route('/companies/new', methods=['GET', 'POST'])
@admin_only
def create():
    form = CompanyForm(flask.request.form)
    if flask.request.method == 'POST':
        if form.validate():
            new_company = flask.request.form.to_dict()
            new_company.pop('csrf_token', None)
            get_resource_service('companies').post([new_company])
            flask.flash(gettext('Company has been updated successfully.'), 'success')
        else:
            return flask.render_template('company.html',
                                         form=form,
                                         form_name='Create',
                                         action='/companies/new'), 400
    return flask.render_template('company.html',
                                 form=form,
                                 form_name='Create',
                                 action='/companies/new'), 201


@blueprint.route('/companies/<id>', methods=['GET', 'POST'])
@admin_only
def edit(id):
    if not id:
        return BadRequest(gettext('Company id not provided'))

    company = find_one('companies', _id=ObjectId(id))
    if flask.request.method == 'POST':
        edited_form = CompanyForm(flask.request.form)
        if edited_form.validate():
            updates = {}
            updates['name'] = edited_form.name.data
            updates['sd_subscriber_id'] = edited_form.sd_subscriber_id.data
            updates['phone'] = edited_form.phone.data
            updates['is_enabled'] = edited_form.is_enabled.data
            updates['contact_name'] = edited_form.contact_name.data
            updates['country'] = edited_form.country.data
            get_resource_service('companies').patch(id=ObjectId(id),
                                                    updates=updates)
            flask.flash(gettext('Company has been updated successfully.'), 'success')
        else:
            return flask.render_template(
                'company.html',
                form=edited_form,
                form_name='Edit',
                action='/companies/{}'.format(id)), 400

    company['id'] = str(company['_id'])
    company_form = CompanyForm(**company)
    return flask.render_template(
        'company.html',
        form=company_form,
        form_name='Edit',
        action='/companies/{}'.format(id)), 200
