
import superdesk

from .topics import TopicsResource, TopicsService, get_user_topics  # noqa


def init_app(app):
    superdesk.register_resource('topics', TopicsResource, TopicsService, _app=app)
