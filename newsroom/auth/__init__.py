import re

import superdesk
from bson import ObjectId
from eve.auth import BasicAuth
from flask import Blueprint, session, abort

blueprint = Blueprint('auth', __name__)


class SessionAuth(BasicAuth):
    def authorized(self, allowed_roles, resource, method):
        return get_user_id()


def get_user(required=False):
    """Get current user.

    If user is required but not set abort.

    :param required: Is user required.
    """
    user_id = get_user_id()
    if user_id:
        user = superdesk.get_resource_service('users').find_one(req=None, _id=user_id)
    else:
        user = None
    if not user and required:
        abort(401)
    return user


def get_user_id():
    """Get user for current user.

    Make sure it's an ObjectId.
    """
    return ObjectId(session.get('user')) if session.get('user') else None


def get_auth_user_by_email(email):
    """ Returns the user from auth by the email case insensitive """
    return _get_user_by_email(email, 'auth_user')


def get_user_by_email(email):
    """ Returns the user from users by the email case insensitive """
    return _get_user_by_email(email, 'users')


def _get_user_by_email(email, repo):
    lookup = {'email': {'$regex': re.compile('^{}$'.format(re.escape(email)), re.IGNORECASE)}}
    users = list(superdesk.get_resource_service(repo).get(req=None, lookup=lookup))
    return users[0] if users else None


from . import views   # noqa
