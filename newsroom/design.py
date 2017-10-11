
import flask

blueprint = flask.Blueprint('design', __name__)


@blueprint.route('/design/')
def index():
    return flask.render_template('design_index.html')


@blueprint.route('/design/<page>')
def page(page):
    return flask.render_template('design_%s.html' % page)
