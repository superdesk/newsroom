from newsroom.agenda import blueprint

import flask

from eve.methods.get import get_internal
from eve.render import send_response
from newsroom.auth import get_user
from newsroom.topics import get_user_topics
from newsroom.navigations.navigations import get_navigations_by_company
from flask import current_app as app


@blueprint.route('/agenda')
def agenda():
    return flask.render_template('agenda_index.html', data=get_view_data())


@blueprint.route('/agenda/search')
def search():
    response = get_internal('agenda')
    return send_response('agenda', response)


def get_view_data():
    user = get_user()
    topics = get_user_topics(user['_id']) if user else []
    return {
        'user': str(user['_id']) if user else None,
        'company': str(user['company']) if user and user.get('company') else None,
        'topics': [t for t in topics if t.get('topic_type') == 'agenda'],
        'formats': [{'format': f['format'], 'name': f['name']} for f in app.download_formatters.values()],
        'navigations': get_navigations_by_company(str(user['company']) if user and user.get('company') else None),
    }
