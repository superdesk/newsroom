from functools import wraps
from flask import request, redirect, url_for, session, abort
from newsroom.utils import is_valid_login


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('name') is None or not is_valid_login(session.get('user')):
            session['user'] = None
            session['name'] = None
            session['user_type'] = None
            return redirect(url_for('auth.login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function


def admin_only(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('user_type') is None or session.get('user_type') != 'administrator' \
                or not is_valid_login(session.get('user')):
            return abort(403)
        return f(*args, **kwargs)
    return decorated_function


def account_manager_only(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('user_type') not in ['administrator', 'account_management'] \
                or not is_valid_login(session.get('user')):
            return abort(403)
        return f(*args, **kwargs)
    return decorated_function
