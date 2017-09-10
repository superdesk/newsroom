import flask
from newsroom.utils import query_resource, find_one
from bson import ObjectId
from werkzeug.exceptions import BadRequest, NotFound
from newsroom.users.forms import UserForm
from superdesk import get_resource_service
from newsroom.users import blueprint
from flask_babel import gettext
from newsroom.auth.decorator import admin_only
from newsroom.auth.views import send_token


@blueprint.route('/users', methods=['GET'])
@admin_only
def index():
    users = init_users()
    return flask.render_template(
        'users.html',
        users=users)


@blueprint.route('/users/<id>', methods=['GET', 'POST'])
@admin_only
def edit(id):
    if not id:
        return BadRequest(gettext('User id not provided'))

    user = find_one('users', _id=ObjectId(id))

    if not user:
        return NotFound(gettext('User not found'))

    user['id'] = str(user['_id'])
    if flask.request.method == 'POST':
        form = UserForm(user=user)
        form.company.choices = init_companies()
        if form.validate_on_submit():
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
            flask.flash(gettext('User has been updated successfully.'), 'success')
        else:
            return flask.render_template('user.html', form=form), 400

    form = UserForm(**user)
    form.company.choices = init_companies()
    return flask.render_template('user.html', form=form), 200


def init_companies():
    companies = list(query_resource('companies', max_results=50))
    choices = [('', '')]
    choices.extend([(str(c['_id']), c['name']) for c in companies])
    return choices


def init_users():
    users = list(query_resource('users', max_results=50))
    companies = list(query_resource('companies', max_results=200))
    company_dict = {str(c['_id']): c['name'] for c in companies}
    for user in users:
        if user.get('company'):
            user['company'] = company_dict[str(user['company'])]
    return users


@blueprint.route('/users/<id>/resend_token', methods=['POST'])
def resend_token(id):
    if not id:
        return BadRequest(gettext('User id not provided'))

    user = find_one('users', _id=ObjectId(id))
    status = 200

    if not user:
        return NotFound(gettext('User not found'))

    if send_token(user, token_type='validate'):
        flask.flash(gettext('A new validation token has been sent to user'), 'success')
    else:
        flask.flash(gettext('Token is not generated.'), 'danger')
        status = 400

    user['id'] = str(user['_id'])
    form = UserForm(**user)
    form.company.choices = init_companies()
    return flask.render_template('user.html', form=form), status
