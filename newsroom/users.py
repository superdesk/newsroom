import flask
from newsroom.utils import query_resource, find_one
from bson import ObjectId
from werkzeug.exceptions import NotFound, BadRequest
from newsroom.forms.user_form import UserForm
from superdesk import get_resource_service
from superdesk.utc import utcnow
from datetime import timedelta
from flask import current_app as app
import bcrypt
from flask_babel import gettext


blueprint = flask.Blueprint('users', __name__)

@blueprint.route('/users', methods=['GET'])
def index():
    # users = list(get_resource_service('users').get(req=None, lookup=None))
    users = list(query_resource('users', max_results=50))
    return flask.render_template(
        'users.html',
        users=users)

@blueprint.route('/user/<id>', methods=['GET', 'POST'])
def edit(id):
    if not id:
        return BadRequest(gettext('User id not provided'))

    user = find_one('users', _id=ObjectId(id))
    if flask.request.method == 'POST':
        edited_form = UserForm(flask.request.form)
        if edited_form.validate():
            updates = {}
            updates['name'] = edited_form.name.data
            updates['email'] = edited_form.email.data
            updates['phone'] = edited_form.phone.data
            user2 = get_resource_service('users').patch(id=ObjectId(id),
                                                updates=updates)
            flask.flash(gettext('User has been updated successfully.'))
        else:
            return flask.render_template(
                'user.html',
                form=edited_form)

    user['id'] = str(user['_id'])
    user_form = UserForm(**user)
    return flask.render_template(
        'user.html',
        form=user_form)

