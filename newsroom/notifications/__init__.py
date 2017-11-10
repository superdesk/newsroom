from flask import Blueprint
import superdesk

blueprint = Blueprint('notifications', __name__)


from .notifications import NotificationsResource, NotificationsService, get_user_notifications  # noqa


def init_app(app):
    superdesk.register_resource('notifications', NotificationsResource, NotificationsService, _app=app)


from . import views  # noqa
from superdesk.notification import push_notification  # noqa
