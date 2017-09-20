from flask import Blueprint, session
from eve.auth import BasicAuth
from bson import ObjectId

blueprint = Blueprint('auth', __name__)


class SessionAuth(BasicAuth):
    def authorized(self, allowed_roles, resource, method):
        return get_user_id()


def get_user_id():
    """Get user for current user.

    Make sure it's an ObjectId.
    """
    return ObjectId(session.get('user')) if session.get('user') else None


from . import views   # noqa
