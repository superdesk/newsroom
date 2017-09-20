import flask
from superdesk import get_resource_service
from superdesk.utc import utcnow
from datetime import timedelta
from flask import current_app as app
import bcrypt
from newsroom.auth import blueprint
from newsroom.auth.forms import SignupForm, LoginForm, TokenForm, ResetPasswordForm
from newsroom.email import send_validate_account_email, send_reset_password_email
from newsroom.utils import get_random_string
from bson import ObjectId
from flask_babel import gettext


@blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = get_resource_service('auth_user').find_one(req=None, email=form.email.data)
        if user is not None and _is_password_valid(form.password.data.encode('UTF-8'), user):
            user = get_resource_service('users').find_one(req=None, _id=user['_id'])

            if not _is_company_enabled(user):
                flask.flash(gettext('Company account has been disabled.'), 'danger')
                return flask.render_template('login.html', form=form)

            if _is_account_enabled(user):
                flask.session['user'] = str(user['_id'])  # str to avoid serialization issues
                flask.session['name'] = user.get('name')
                flask.session['user_type'] = user['user_type']
                return flask.redirect(flask.request.args.get('next') or flask.url_for('wire.index'))
        else:
            flask.flash(gettext('Invalid username or password.'), 'danger')
    return flask.render_template('login.html', form=form)


def _is_password_valid(password, user):
    """
    Checks the password of the user
    """
    hashed = user.get('password').encode('UTF-8')

    if not bcrypt.checkpw(password, hashed):
        return False

    return True


def _is_company_enabled(user):
    """
    Checks if the company of the user is enabled
    """
    if not user.get('company'):
        # there's no company assigned for this user so this check doesn't apply
        return True

    company = get_resource_service('companies').find_one(req=None, _id=user.get('company'))
    if not company:
        return False

    return company.get('is_enabled', False)


def _is_account_enabled(user):
    """
    Checks if user account is active and approved
    """
    if not user.get('is_enabled'):
        flask.flash(gettext('Account is disabled'), 'danger')
        return False

    if not user.get('is_approved'):
        account_created = user.get('_created')

        if account_created < utcnow() + timedelta(days=-app.config.get('NEW_ACCOUNT_ACTIVE_DAYS', 14)):
            flask.flash(gettext('Account has not been approved'), 'danger')
            return False

    return True


@blueprint.route('/logout')
def logout():
    flask.session['user'] = None
    flask.session['name'] = None
    flask.session['user_type'] = None
    return flask.redirect(flask.url_for('wire.index'))


@blueprint.route('/signup', methods=['GET', 'POST'])
def signup():
    form = SignupForm()
    if form.validate_on_submit():
        new_user = form.data
        _modify_user_data(new_user)
        add_token_data(new_user)
        get_resource_service('users').post([new_user])
        send_validate_account_email(new_user['name'], new_user['email'], new_user['token'])
        flask.flash(gettext('Validation email has been sent. Please check your emails.'), 'success')
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
    new_user.pop('csrf_token', None)


def add_token_data(user):
    user['token'] = get_random_string()
    user['token_expiry_date'] = utcnow() + timedelta(days=app.config['VALIDATE_ACCOUNT_TOKEN_TIME_TO_LIVE'])


@blueprint.route('/validate/<token>')
def validate_account(token):
    user = get_resource_service('users').find_one(req=None, token=token)
    if not user:
        flask.abort(404)

    if user.get('is_validated'):
        return flask.redirect(flask.url_for('auth.login'))

    if user.get('token_expiry_date') > utcnow():
        updates = {'is_validated': True, 'token': None, 'token_expiry_date': None}
        get_resource_service('users').patch(id=ObjectId(user['_id']), updates=updates)
        flask.flash(gettext('Your account has been validated.'), 'success')
        return flask.redirect(flask.url_for('auth.login'))

    flask.flash(gettext('Token has expired. Please create a new token'), 'danger')
    flask.redirect(flask.url_for('auth.token', token_type='validate'))


@blueprint.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    user = get_resource_service('users').find_one(req=None, token=token)
    if not user:
        flask.abort(404)

    form = ResetPasswordForm()
    if form.validate_on_submit():
        updates = {'password': form.new_password.data, 'token': None, 'token_expiry_date': None}
        get_resource_service('users').patch(id=ObjectId(user['_id']), updates=updates)
        flask.flash(gettext('Your password has been changed. Please login again.'), 'success')
        return flask.redirect(flask.url_for('auth.login'))
    return flask.render_template('reset_password.html', form=form, token=token)


@blueprint.route('/token/<token_type>', methods=['GET', 'POST'])
def token(token_type):
    form = TokenForm()
    if form.validate_on_submit():
        user = get_resource_service('users').find_one(req=None, email=form.email.data)
        send_token(user, token_type)
        flask.flash(gettext('A new reset password token has been sent. Please check your emails'), 'success')
        return flask.redirect(flask.url_for('auth.login'))
    return flask.render_template('request_token.html', form=form, token_type=token_type)


def send_token(user, token_type='validate'):
    if user is not None and user.get('is_enabled', False):

        if token_type == 'validate' and user.get('is_validated', False):
            return False

        updates = {}
        add_token_data(updates)
        get_resource_service('users').patch(id=ObjectId(user['_id']), updates=updates)
        if token_type == 'validate':
            send_validate_account_email(user['name'], user['email'], updates['token'])
        elif token_type == 'reset_password':
            send_reset_password_email(user['name'], user['email'], updates['token'])
        return True
    return False
