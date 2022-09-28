import re

import flask
from bson import ObjectId
from flask import jsonify, current_app as app
from flask_babel import gettext
from superdesk import get_resource_service
from werkzeug.exceptions import BadRequest, NotFound

from newsroom.auth import get_user, get_user_by_email
from newsroom.auth.views import send_token, add_token_data, \
    is_current_user_admin, is_current_user, is_current_user_account_mgr
from newsroom.decorator import admin_only, login_required, account_manager_only
from newsroom.companies import get_user_company_name, get_company_sections_monitoring_data, clean_company
from newsroom.notifications.notifications import get_user_notifications
from newsroom.notifications import push_user_notification
from newsroom.topics import get_user_topics
from newsroom.users import blueprint
from newsroom.users.forms import UserForm
from newsroom.utils import query_resource, find_one, get_json_or_400, get_vocabulary, clean_user
from newsroom.monitoring.views import get_monitoring_for_company


def get_settings_data():
    return {
        'users': [clean_user(u) for u in query_resource('users')],
        "companies": [clean_company(company) for company in query_resource('companies')]
    }


def get_view_data():
    user = get_user()
    company = user['company'] if user and user.get('company') else None
    rv = {
        'user': user if user else None,
        'company': str(company),
        'topics': get_user_topics(user['_id']) if user else [],
        'companyName': get_user_company_name(user),
        'locators': get_vocabulary('locators'),
        'monitoring_list': get_monitoring_for_company(user),
    }

    rv.update(get_company_sections_monitoring_data(company))

    return rv


@blueprint.route('/myprofile', methods=['GET'])
@login_required
def user_profile():
    return flask.render_template('user_profile.html', data=get_view_data())


@blueprint.route('/users/search', methods=['GET'])
@account_manager_only
def search():
    lookup = None
    if flask.request.args.get('q'):
        regex = re.compile('.*{}.*'.format(flask.request.args.get('q')), re.IGNORECASE)
        lookup = {'$or': [{'first_name': regex}, {'last_name': regex}]}

    if flask.request.args.get('ids'):
        lookup = {'_id': {'$in': (flask.request.args.get('ids') or '').split(',')}}

    users = [clean_user(u) for u in query_resource('users', lookup=lookup)]
    return jsonify(users), 200


@blueprint.route('/users/new', methods=['POST'])
@account_manager_only
def create():
    form = UserForm()
    if form.validate():
        if not _is_email_address_valid(form.email.data):
            return jsonify({'email': ['Email address is already in use']}), 400

        new_user = form.data
        add_token_data(new_user)
        if form.company.data:
            new_user['company'] = ObjectId(form.company.data)

        # Flask form won't accept default value if any form data was passed in the request.
        # So, we need to set this explicitly here.
        new_user['receive_email'] = True

        get_resource_service('users').post([new_user])
        send_token(new_user, token_type='new_account')
        return jsonify({'success': True}), 201
    return jsonify(form.errors), 400


def _is_email_address_valid(email):
    existing_user = get_user_by_email(email)
    return not existing_user


def _user_allowed_field(updates, user):
    """
    For public users there is a restricted list of fields that can be updated this function  ensures that only the
    listed fields have changed, The list corresponds to the field in UserProfile.jsx
    :param updates:
    :param user:
    :return:
    """
    allowed_fields = ('first_name', 'last_name', 'phone', 'mobile', 'role', 'receive_email', 'locale')
    for key, value in updates.items():
        if key in updates and key not in allowed_fields and value != user.get(key, ''):
            return False
    return True


@blueprint.route('/users/<_id>', methods=['GET', 'POST'])
@login_required
def edit(_id):
    if not (is_current_user_admin() or is_current_user_account_mgr()) and not is_current_user(_id):
        flask.abort(401)

    user = find_one('users', _id=ObjectId(_id))

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

            # account manager can do anything but promote themselves to admin
            if is_current_user_account_mgr() and updates.get('user_type', '') != user.get('user_type', ''):
                flask.abort(401)

            if not (is_current_user_admin() or is_current_user_account_mgr())\
                    and not _user_allowed_field(updates, user):
                flask.abort(401)

            user = get_resource_service('users').patch(ObjectId(_id), updates=updates)
            app.cache.delete(user.get('email'))
            app.cache.delete(_id)
            return jsonify({'success': True}), 200
        return jsonify(form.errors), 400
    return jsonify(user), 200


@blueprint.route('/users/<_id>/validate', methods=['POST'])
@admin_only
def validate(_id):
    return _resend_token(_id, token_type='validate')


@blueprint.route('/users/<_id>/reset_password', methods=['POST'])
@account_manager_only
def resend_token(_id):
    return _resend_token(_id, token_type='reset_password')


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


@blueprint.route('/users/<_id>', methods=['DELETE'])
@admin_only
def delete(_id):
    """ Deletes the user by given id """
    get_resource_service('users').delete_action({'_id': ObjectId(_id)})
    return jsonify({'success': True}), 200


@blueprint.route('/users/<_id>/topics', methods=['GET'])
@login_required
def get_topics(_id):
    """ Returns list of followed topics of given user """
    if flask.session['user'] != str(_id):
        flask.abort(403)
    return jsonify({'_items': get_user_topics(_id)}), 200


@blueprint.route('/users/<_id>/topics', methods=['POST'])
@login_required
def post_topic(_id):
    """Creates a user topic"""
    if flask.session['user'] != str(_id):
        flask.abort(403)

    topic = get_json_or_400()
    topic['user'] = ObjectId(_id)

    ids = get_resource_service('topics').post([topic])
    push_user_notification('topic_created')
    return jsonify({'success': True, '_id': ids[0]}), 201


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

    get_resource_service('notifications').delete_action({'user': ObjectId(user_id)})
    return jsonify({'success': True}), 200


@blueprint.route('/users/<user_id>/notifications/<notification_id>', methods=['DELETE'])
@login_required
def delete_notification(user_id, notification_id):
    """ Deletes the notification by given id """
    if flask.session['user'] != str(user_id):
        flask.abort(403)

    get_resource_service('notifications').delete_action({'_id': notification_id})
    return jsonify({'success': True}), 200
