import superdesk

from flask import Blueprint, session, abort
from eve.auth import BasicAuth
from bson import ObjectId

from .decorator import login_required, admin_only  # noqa

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


from . import views   # noqa
