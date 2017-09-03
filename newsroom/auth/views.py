import flask
from superdesk import get_resource_service
from superdesk.utc import utcnow
from datetime import timedelta
from flask import current_app as app
import bcrypt
from newsroom.auth import blueprint
from newsroom.auth.forms import SignupForm, LoginForm


@blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = get_resource_service('auth_user').find_one(req=None, email=form.email.data)
        if user is not None and _is_password_valid(form.password.data.encode('UTF-8'), user):
            user = get_resource_service('users').find_one(req=None, _id=user['_id'])
            if is_account_valid(user):
                flask.session['name'] = user.get('name')
                flask.session['user_type'] = user['user_type']
                return flask.redirect(flask.request.args.get('next') or flask.url_for('news.index'))
        else:
            flask.flash('Invalid username or password.', 'danger')
    return flask.render_template('login.html', form=form)


def _is_password_valid(password, user):
    """
    Checks the password of the user
    """
    hashed = user.get('password').encode('UTF-8')

    if not bcrypt.checkpw(password, hashed):
        return False

    return True


def is_account_valid(user):
    """
    Checks if user account is active and approved
    """
    if not user.get('is_enabled'):
        flask.flash('Account is disabled', 'danger')
        return False

    if not user.get('is_approved'):
        account_created = user.get('_created')

        if account_created < utcnow() + timedelta(days=-app.config.get('NEW_ACCOUNT_ACTIVE_DAYS', 14)):
            flask.flash('Account has not been approved', 'danger')
            return False

    return True


@blueprint.route('/logout')
def logout():
    flask.session['name'] = None
    flask.session['user_type'] = None
    return flask.redirect(flask.url_for('news.index'))


@blueprint.route('/signup', methods=['GET', 'POST'])
def signup():
    form = SignupForm()
    if form.validate_on_submit():
        new_user = form.data
        _modify_user_data(new_user)
        get_resource_service('users').post([new_user])
        flask.flash('User has been created', 'success')
        return flask.redirect(flask.url_for('auth.login'))
    return flask.render_template('signup.html', form=form)


def _modify_user_data(new_user):
    """
    Modifies the user data to make it compatible with user schema
    """
    new_user['signup_details'] = {
        'company': new_user.get('company'),
        'occupation': new_user.get('occupation'),
        'company_size': new_user.get('company_size'),
    }
    new_user.pop('email2', None)
    new_user.pop('password2', None)
    new_user.pop('company', None)
    new_user.pop('occupation', None)
    new_user.pop('company_size', None)
