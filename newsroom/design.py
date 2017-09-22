
import flask

blueprint = flask.Blueprint('design', __name__)


@blueprint.route('/design/')
def index():
    return flask.render_template('design_index.html')


@blueprint.route('/design/wire')
def wire():
    return flask.render_template('design_wire.html')


@blueprint.route('/design/users')
def users():
    return flask.render_template('design_users.html')
