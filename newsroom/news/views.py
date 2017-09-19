import flask

from eve.render import send_response
from eve.methods.get import get_internal

from newsroom.news import blueprint


@blueprint.route('/')
def index():
    return flask.render_template('news_index.html')


@blueprint.route('/search')
def search():
    response = get_internal('wire_search')
    return send_response('wire_search', response)
