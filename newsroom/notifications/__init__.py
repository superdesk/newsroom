import superdesk

from flask import Blueprint
from superdesk.notification import push_notification  # noqa

blueprint = Blueprint('notifications', __name__)


from .notifications import NotificationsResource, NotificationsService, get_user_notifications  # noqa


def init_app(app):
    superdesk.register_resource('notifications', NotificationsResource, NotificationsService, _app=app)
