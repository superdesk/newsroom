import flask
from newsroom.public import blueprint


@blueprint.route('/copyright')
def copyright():
    return flask.render_template('copyright.html')
