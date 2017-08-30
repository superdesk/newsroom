from functools import wraps
from flask import request, redirect, url_for, session, abort


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('name') is None:
            return redirect(url_for('auth.login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function


def admin_only(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('user_type') is None or session.get('user_type') != 'administrator':
            return abort(403)
        return f(*args, **kwargs)
    return decorated_function
