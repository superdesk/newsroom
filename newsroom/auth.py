import flask
from newsroom.utils import query_resource
from superdesk import get_resource_service
from superdesk.utc import utcnow
from datetime import timedelta
from flask import current_app as app
import bcrypt
from flask_babel import gettext


blueprint = flask.Blueprint('auth', __name__)


@blueprint.route('/login', methods=['GET', 'POST'])
def login():
    kwargs = {}
    if flask.request.method == 'POST':
        try:
            credentials = flask.request.form

            user = get_resource_service('auth_user').find_one(req=None, email=credentials.get('email'))

            if not user:
                raise Exception(gettext('Wrong email or password'))

            if not user.get('is_enabled'):
                raise Exception(gettext('Account is disabled'))

            if not user.get('is_approved'):
                account_created = user.get('_created')

                if account_created < utcnow() + timedelta(days=-app.config.get('NEW_ACCOUNT_ACTIVE_DAYS', 14)):
                    raise Exception(gettext('Account has not been approved'))

            password = credentials.get('password').encode('UTF-8')
            hashed = user.get('password').encode('UTF-8')

            if not (password and hashed):
                raise Exception('Wrong email or password')

            if not bcrypt.checkpw(password, hashed):
                raise Exception(gettext('Wrong email or password'))

            user = get_resource_service('users').find_one(req=None, _id=user['_id'])

            flask.session['name'] = user.get('name')
            return flask.redirect(flask.url_for('news.index'))
        except Exception as ex:
            flask.flash(gettext('Invalid login: {} Please try again.'.format(str(ex))))
            return flask.render_template('auth_login.html')

    return flask.render_template('auth_login.html',
                                 email=flask.request.args.get('email'),
                                 **kwargs)


@blueprint.route('/logout')
def logout():
    flask.session['name'] = None
    return flask.redirect(flask.url_for('news.index'))


@blueprint.route('/signup', methods=['GET', 'POST'])
def signup():
    if flask.request.method == 'POST':
        try:
            new_user = flask.request.form.to_dict()
            _validate_new_user(new_user)
            _modify_user_data(new_user)
            get_resource_service('users').post([new_user])
        except Exception as ex:
            flask.flash('User could not be created: {}'.format(str(ex)))
            return flask.render_template('signup.html', **new_user)
        return flask.redirect(flask.url_for('auth.login', email=new_user.get('email')))
    return flask.render_template('signup.html')


def _validate_new_user(new_user):
    if not new_user.get('email'):
        raise Exception(gettext('Email cannot be empty'))

    if not new_user.get('name'):
        raise Exception(gettext('Name cannot be empty'))

    if not new_user.get('password'):
        raise Exception(gettext('Password cannot be empty'))

    if new_user.get('email') != new_user.get('email2'):
        raise Exception(gettext('Email addresses do not match'))

    existing_users = query_resource('users', {'email': new_user.get('email')})

    if existing_users.count() > 0:
        raise Exception(gettext('Email address is already in use'))


def _modify_user_data(new_user):
    """
    Modifies the user data to make it compatible with user schema
    """
    new_user['signup_details'] = {
        'company': new_user.get('company'),
        'occupation': new_user.get('occupation'),
        'company_size': new_user.get('company_size'),
    }
    new_user.pop('email2')
    new_user.pop('company')
    new_user.pop('occupation')
    new_user.pop('company_size')
