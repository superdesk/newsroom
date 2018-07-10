from newsroom.agenda import blueprint

import flask

from eve.methods.get import get_internal
from eve.render import send_response
from newsroom.topics import get_user_topics
from newsroom.navigations.navigations import get_navigations_by_company
from flask import current_app as app, abort
from newsroom.auth import get_user, login_required
from newsroom.utils import get_entity_or_404
from newsroom.wire.views import update_action_list
from flask_babel import gettext


@blueprint.route('/agenda')
@login_required
def agenda():
    return flask.render_template('agenda_index.html', data=get_view_data())


@blueprint.route('/agenda/<_id>')
@login_required
def item(_id):
    item = get_entity_or_404(_id, 'agenda')
    if flask.request.args.get('format') == 'json':
        return flask.jsonify(item)

    if 'print' in flask.request.args:
        template = 'agenda_item_print.html'
        update_action_list([_id], 'prints', force_insert=True)
        return flask.render_template(template, item=item)

    return abort(400, gettext('No format provided'))


@blueprint.route('/agenda/search')
@login_required
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
        'navigations': get_navigations_by_company(str(user['company']) if user and user.get('company') else None,
                                                  product_type='agenda'),
    }
