import flask
from newsroom.utils import query_resource, find_one, json_serialize_datetime_objectId
from bson import ObjectId
from werkzeug.exceptions import BadRequest, NotFound
from newsroom.users.forms import UserForm
from superdesk import get_resource_service
from newsroom.users import blueprint
from flask_babel import gettext
from newsroom.auth.decorator import admin_only
from newsroom.auth.views import send_token, add_token_data, send_reset_password_email
import json


@blueprint.route('/users', methods=['GET'])
@admin_only
def index():
    users = init_users()
    return flask.render_template(
        'users.html',
        users=users)


@blueprint.route('/users/search', methods=['GET'])
@admin_only
def search():
    users = init_users()
    response = flask.current_app.response_class(
        response=json.dumps(users, default=json_serialize_datetime_objectId),
        status=200,
        mimetype='application/json'
    )
    return response


@blueprint.route('/users/new', methods=['GET', 'POST'])
@admin_only
def create():
    form = UserForm(flask.request.form)
    form.company.choices = init_companies()

    if flask.request.method == 'POST':
        if form.validate() and _is_email_address_valid(form.email.data):
            new_user = flask.request.form.to_dict()
            add_token_data(new_user)
            new_user.pop('csrf_token', None)
            if form.company.data:
                new_user['company'] = ObjectId(form.company.data)
            get_resource_service('users').post([new_user])
            flask.flash(gettext('User has been created successfully.'), 'success')
            send_reset_password_email(new_user['name'], new_user['email'], new_user['token'])
        else:
            return flask.render_template('user.html',
                                         form=form,
                                         form_name='Create',
                                         action='/users/new'), 400
    return flask.render_template('user.html',
                                 form=form,
                                 form_name='Create',
                                 action='/users/new'), 201


def _is_email_address_valid(email):
    existing_users = query_resource('users', {'email': email})
    if existing_users.count() > 0:
        flask.flash(gettext('Email address is already in use'), 'danger')
        return False
    return True


@blueprint.route('/users/<id>', methods=['GET', 'POST'])
@admin_only
def edit(id):
    user = find_one('users', _id=ObjectId(id))

    if not user:
        return NotFound(gettext('User not found'))

    user['id'] = str(user['_id'])
    if flask.request.method == 'POST':
        form = UserForm(user=user)
        form.company.choices = init_companies()
        form.email.disabled = True
        if form.validate_on_submit() and \
                (form.email.data == user['email'] or _is_email_address_valid(form.email.data)):
            updates = {}
            updates['name'] = form.name.data
            updates['email'] = form.email.data
            updates['phone'] = form.phone.data
            updates['user_type'] = form.user_type.data
            updates['is_enabled'] = form.is_enabled.data
            updates['is_approved'] = form.is_approved.data
            if form.company.data:
                updates['company'] = ObjectId(form.company.data)

            get_resource_service('users').patch(id=ObjectId(id), updates=updates)
            return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}
        return json.dumps(form.errors), 400, {'ContentType': 'application/json'}


def init_companies():
    companies = list(query_resource('companies', max_results=50))
    choices = [('', '')]
    choices.extend([(str(c['_id']), c['name']) for c in companies])
    return choices


def init_users():
    users = list(query_resource('users', max_results=50))
    return users


@blueprint.route('/users/<id>/validate', methods=['POST'])
@admin_only
def validate(id):
    return _resend_token(id, token_type='validate')


@blueprint.route('/users/<id>/reset_password', methods=['POST'])
@admin_only
def resend_token(id):
    return _resend_token(id, token_type='reset_password')


def _resend_token(user_id, token_type):
    """
    Sends a new token for a given user_id
    :param user_id: Id of the user to send the token
    :param token_type: validate or reset_password
    :return:
    """
    if not user_id:
        return BadRequest(gettext('User id not provided'))

    user = find_one('users', _id=ObjectId(user_id))
    status = 200

    if not user:
        return NotFound(gettext('User not found'))

    if send_token(user, token_type):
        flask.flash(gettext('A new token has been sent to user'), 'success')
    else:
        flask.flash(gettext('Token is not generated.'), 'danger')
        status = 400

    user['id'] = str(user['_id'])
    form = UserForm(**user)
    form.company.choices = init_companies()
    return flask.render_template('user.html', form=form), status


@blueprint.route('/users/<id>', methods=['DELETE'])
@admin_only
def delete(id):
    """ Deletes the user by given id """
    get_resource_service('users').delete({'_id': ObjectId(id)})
    flask.flash(gettext('User has been deleted'), 'success')
    return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}
