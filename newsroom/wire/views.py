import io
import flask
import zipfile
import superdesk

from flask import current_app as app
from eve.render import send_response
from eve.methods.get import get_internal
from werkzeug.utils import secure_filename
from flask_babel import gettext

from newsroom.wire import blueprint
from newsroom.auth import get_user, login_required
from newsroom.topics import get_user_topics
from newsroom.email import send_email


def get_item_or_404(_id):
    item = superdesk.get_resource_service('items').find_one(req=None, _id=_id)
    if not item:
        flask.abort(404)
    return item


@blueprint.route('/')
def index():
    user = get_user()
    data = {
        'user': str(user['_id']) if user else None,
        'company': str(user['company']) if user and user.get('company') else None,
        'topics': get_user_topics(user['_id']) if user else [],
    }
    return flask.render_template('wire_index.html', data=data)


@blueprint.route('/search')
def search():
    response = get_internal('wire_search')
    return send_response('wire_search', response)


@blueprint.route('/download/<_id>')
def download(_id):
    item = get_item_or_404(_id)
    _file = io.BytesIO()
    with zipfile.ZipFile(_file, mode='w') as zf:
        zf.writestr(
            secure_filename('{}.txt'.format(item['_id'])),
            str.encode(flask.render_template('download_item.txt', item=item), 'utf-8')
        )
    _file.seek(0)
    return flask.send_file(_file, attachment_filename='newsroom.zip', as_attachment=True)


@blueprint.route('/wire/<_id>')
def item(_id):
    item = get_item_or_404(_id)
    if 'print' in flask.request.args:
        return flask.render_template('wire_item_print.html', item=item)
    return flask.render_template('wire_item.html', item=item)


@blueprint.route('/wire/<_id>/share', methods=['POST'])
@login_required
def share(_id):
    current_user = get_user(required=True)
    item = get_item_or_404(_id)
    data = flask.request.get_json()
    assert isinstance(data, dict)
    assert data.get('users')
    with app.mail.connect() as connection:
        for user_id in data['users']:
            user = superdesk.get_resource_service('users').find_one(req=None, _id=user_id)
            if not user or not user.get('email'):
                continue
            template_kwargs = {
                'recipient': user,
                'sender': current_user,
                'item': item,
                'message': data.get('message'),
            }
            send_email(
                [user['email']],
                gettext('From %s: %s' % (app.config['SITE_NAME'], item['headline'])),
                flask.render_template('share_item.txt', **template_kwargs),
                sender=current_user['email'],
                connection=connection
            )
    return flask.jsonify(), 201
