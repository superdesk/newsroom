import flask
from newsroom.utils import query_resource, find_one
from bson import ObjectId
from werkzeug.exceptions import BadRequest
from newsroom.users.forms import UserForm
from superdesk import get_resource_service
from newsroom.users import blueprint
from flask_babel import gettext


@blueprint.route('/users', methods=['GET'])
def index():
    users = init_users()
    return flask.render_template(
        'users.html',
        users=users)


@blueprint.route('/users/<id>', methods=['GET', 'POST'])
def edit(id):
    if not id:
        return BadRequest(gettext('User id not provided'))

    user = find_one('users', _id=ObjectId(id))

    if flask.request.method == 'POST':
        edited_form = UserForm(flask.request.form)
        edited_form.company.choices = init_companies()
        if edited_form.validate():
            updates = {}
            updates['name'] = edited_form.name.data
            updates['email'] = edited_form.email.data
            updates['phone'] = edited_form.phone.data
            if edited_form.company.data:
                updates['company'] = ObjectId(edited_form.company.data)
            else:
                updates['company'] = None
            get_resource_service('users').patch(id=ObjectId(id),
                                                updates=updates)
            flask.flash(gettext('User has been updated successfully.'))
        else:
            return flask.render_template(
                'user.html',
                form=edited_form), 400

    user['id'] = str(user['_id'])
    user_form = UserForm(**user)
    user_form.company.choices = init_companies()
    return flask.render_template(
        'user.html',
        form=user_form), 200


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
        user['company'] = company_dict[str(user['company'])]
    return users
