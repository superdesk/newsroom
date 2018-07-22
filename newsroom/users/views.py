import flask
from newsroom.utils import query_resource, find_one
from bson import ObjectId
from werkzeug.exceptions import BadRequest, NotFound
from newsroom.users.forms import UserForm
from superdesk import get_resource_service
from newsroom.users import blueprint
from flask_babel import gettext
from newsroom.notifications.notifications import get_user_notifications
from newsroom.auth import get_user
from newsroom.auth.decorator import admin_only, login_required
from newsroom.auth.views import send_token, add_token_data, \
    is_current_user_admin, is_current_user
from newsroom.topics import get_user_topics
from flask import jsonify, current_app as app
from newsroom.companies import get_user_company_name
import re


@blueprint.route('/settings/users', methods=['GET'])
@admin_only
def settings():
    data = {
        'users': list(query_resource('users')),
        "companies": list(query_resource('companies')),
    }
    return flask.render_template('settings.html', setting_type="users", data=data)


def get_view_data():
    user = get_user()
    return {
        'user': user if user else None,
        'company': str(user['company']) if user and user.get('company') else None,
        'topics': get_user_topics(user['_id']) if user else [],
        'companyName': get_user_company_name(user),
    }


@blueprint.route('/myprofile', methods=['GET'])
@login_required
def user_profile():
    return flask.render_template('user_profile.html', data=get_view_data())


@blueprint.route('/users/search', methods=['GET'])
@admin_only
def search():
    lookup = None
    if flask.request.args.get('q'):
        regex = re.compile('.*{}.*'.format(flask.request.args.get('q')), re.IGNORECASE)
        lookup = {'$or': [{'first_name': regex}, {'last_name': regex}]}
    users = list(query_resource('users', lookup=lookup))
    return jsonify(users), 200


@blueprint.route('/users/new', methods=['POST'])
@admin_only
def create():
    form = UserForm()
    if form.validate():
        if not _is_email_address_valid(form.email.data):
            return jsonify({'email': ['Email address is already in use']}), 400

        new_user = form.data
        add_token_data(new_user)
        if form.company.data:
            new_user['company'] = ObjectId(form.company.data)
        get_resource_service('users').post([new_user])
        send_token(new_user, token_type='new_account')
        return jsonify({'success': True}), 201
    return jsonify(form.errors), 400


def _is_email_address_valid(email):
    existing_users = query_resource('users', {'email': email})
    if existing_users.count() > 0:
        return False
    return True


@blueprint.route('/users/<id>', methods=['GET', 'POST'])
@login_required
def edit(id):
    if not is_current_user_admin() and not is_current_user(id):
        flask.abort(401)

    user = find_one('users', _id=ObjectId(id))

    if not user:
        return NotFound(gettext('User not found'))

    if flask.request.method == 'POST':
        form = UserForm(user=user)
        if form.validate_on_submit():
            if form.email.data != user['email'] and not _is_email_address_valid(form.email.data):
                return jsonify({'email': ['Email address is already in use']}), 400

            updates = form.data
            if form.company.data:
                updates['company'] = ObjectId(form.company.data)

            get_resource_service('users').patch(id=ObjectId(id), updates=updates)
            app.cache.delete(user.get('email'))
            return jsonify({'success': True}), 200
        return jsonify(form.errors), 400
    return jsonify(user), 200


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

    if not user:
        return NotFound(gettext('User not found'))

    if send_token(user, token_type):
        return jsonify({'success': True}), 200

    return jsonify({'message': 'Token could not be sent'}), 400


@blueprint.route('/users/<id>', methods=['DELETE'])
@admin_only
def delete(id):
    """ Deletes the user by given id """
    get_resource_service('users').delete({'_id': ObjectId(id)})
    return jsonify({'success': True}), 200


@blueprint.route('/users/<id>/topics', methods=['GET'])
@login_required
def get_topics(id):
    """ Returns list of followed topics of given user """
    if flask.session['user'] != str(id):
        flask.abort(403)
    return jsonify({'_items': get_user_topics(id)}), 200


@blueprint.route('/users/<user_id>/notifications', methods=['GET'])
@login_required
def get_notifications(user_id):
    if flask.session['user'] != str(user_id):
        flask.abort(403)
    return jsonify({'_items': get_user_notifications(user_id)}), 200


@blueprint.route('/users/<user_id>/notifications', methods=['DELETE'])
@login_required
def delete_all(user_id):
    """ Deletes all notification by given user id """
    if flask.session['user'] != str(user_id):
        flask.abort(403)

    get_resource_service('notifications').delete({'user': ObjectId(user_id)})
    return jsonify({'success': True}), 200


@blueprint.route('/users/<user_id>/notifications/<notification_id>', methods=['DELETE'])
@login_required
def delete_notification(user_id, notification_id):
    """ Deletes the notification by given id """
    if flask.session['user'] != str(user_id):
        flask.abort(403)

    get_resource_service('notifications').delete({'_id': notification_id})
    return jsonify({'success': True}), 200
