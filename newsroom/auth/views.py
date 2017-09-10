import flask
from superdesk import get_resource_service
from superdesk.utc import utcnow
from datetime import timedelta
from flask import current_app as app
import bcrypt
from newsroom.auth import blueprint
from newsroom.auth.forms import SignupForm, LoginForm, TokenForm
from newsroom.email import send_validate_account_email
from newsroom.utils import get_random_string
from bson import ObjectId


@blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = get_resource_service('auth_user').find_one(req=None, email=form.email.data)
        if user is not None and _is_password_valid(form.password.data.encode('UTF-8'), user):
            user = get_resource_service('users').find_one(req=None, _id=user['_id'])

            if not user.get('is_validated'):
                flask.flash('Your email address needs validation.', 'danger')
                return flask.render_template('login.html', form=form)

            if not _is_company_enabled(user):
                flask.flash('Company account has been disabled.', 'danger')
                return flask.render_template('login.html', form=form)

            if _is_account_enabled(user):
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
        _add_token_data(new_user)
        get_resource_service('users').post([new_user])
        send_validate_account_email(new_user['name'], new_user['email'], new_user['token'])
        flask.flash('Validation email has been sent. Please check your emails.', 'success')
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


def _add_token_data(user):
    user['token'] = get_random_string()
    user['token_expiry_date'] = utcnow() + timedelta(days=app.config['VALIDATE_ACCOUNT_TOKEN_TIME_TO_LIVE'])


@blueprint.route('/validate')
def validate_account():
    token = flask.request.args['token']
    if token:
        user = get_resource_service('users').find_one(req=None, token=token)
        if not user:
            flask.abort(404)

        if user.get('is_validated'):
            return flask.redirect(flask.url_for('auth.login'))

        if user.get('token_expiry_date') > utcnow():
            updates = {'is_validated': True, 'token': None, 'token_expiry_date': None}
            get_resource_service('users').patch(id=ObjectId(user['_id']), updates=updates)
            flask.flash('Your account has been validated.', 'success')
            return flask.redirect(flask.url_for('auth.login'))

        flask.flash('Token has expired. Please create a new token', 'danger')
        flask.redirect(flask.url_for('auth.token', token_type='validate'))
    else:
        flask.abort(404)


@blueprint.route('/token', methods=['GET', 'POST'])
def token():
    form = TokenForm()
    token_type = flask.request.args['token_type']
    if form.validate_on_submit():
        user = get_resource_service('users').find_one(req=None, email=form.email.data)
        if user is not None:
            updates = {}
            _add_token_data(updates)
            get_resource_service('users').patch(id=ObjectId(user['_id']), updates=updates)
            send_validate_account_email(user['name'], user['email'], updates['token'])
        flask.flash('A new validation token has been sent. Please check your emails')
        return flask.redirect(flask.url_for('auth.login'))
    return flask.render_template('request_token.html', form=form, token_type=token_type)
