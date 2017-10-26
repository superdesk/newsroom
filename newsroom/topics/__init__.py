from flask import Blueprint
import superdesk

blueprint = Blueprint('topics', __name__)


from .topics import TopicsResource, TopicsService, get_user_topics  # noqa


def init_app(app):
    superdesk.register_resource('topics', TopicsResource, TopicsService, _app=app)


from . import views  # noqa
