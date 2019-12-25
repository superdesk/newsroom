import flask
from newsroom.public import blueprint


@blueprint.route('/privacy')
def privacy():
    return flask.render_template('privacy.html')


@blueprint.route('/terms')
def terms():
    return flask.render_template('terms.html')


@blueprint.route('/contact')
def contact():
    return flask.render_template('contact.html')
