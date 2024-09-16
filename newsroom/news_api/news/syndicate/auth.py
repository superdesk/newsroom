from functools import wraps
from flask import current_app as app
import flask


def authenticate(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth = app.auth
        token = kwargs.get('token')
        if not auth.authorized([], None, flask.request.method):
            if token:
                if not auth.check_auth(token, allowed_roles=None, resource=None, method=flask.request.method):
                    return auth.authenticate()
            else:
                return auth.authenticate()
        return func(*args, **kwargs)
    return wrapper
