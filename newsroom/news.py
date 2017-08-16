import flask


blueprint = flask.Blueprint('news', __name__)  # noqa


@blueprint.route('/')
def index():
    return flask.render_template('news_index.html')
