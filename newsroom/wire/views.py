import flask

from eve.render import send_response
from eve.methods.get import get_internal

from newsroom.wire import blueprint
from newsroom.auth import get_user_id
from newsroom.topics import get_user_topics


@blueprint.route('/')
def index():
    user_id = get_user_id()
    data = {
        'user': str(user_id) if user_id else None,
        'topics': get_user_topics(user_id) if user_id else [],
    }
    return flask.render_template('wire_index.html', data=data)


@blueprint.route('/search')
def search():
    response = get_internal('wire_search')
    return send_response('wire_search', response)
