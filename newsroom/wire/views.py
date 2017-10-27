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
from newsroom.auth import get_user, get_user_id, login_required
from newsroom.topics import get_user_topics
from newsroom.email import send_email


def get_item_or_404(_id):
    item = superdesk.get_resource_service('items').find_one(req=None, _id=_id)
    if not item:
        flask.abort(404)
    return item


def get_json_or_400():
    data = flask.request.get_json()
    if not isinstance(data, dict):
        flask.abort(400)
    return data


def get_view_data():
    user = get_user()
    return {
        'user': str(user['_id']) if user else None,
        'company': str(user['company']) if user and user.get('company') else None,
        'topics': get_user_topics(user['_id']) if user else [],
        'formats': [{'format': f['format'], 'name': f['name']} for f in app.download_formatters.values()],
        'services': [
            {'label': 'National', 'code': 'f'},
            {'label': 'Courts', 'code': 'c'},
            {'label': 'Entertainment', 'code': 'e'},
            {'label': 'Finance', 'code': ''},
            {'label': 'Politics', 'code': 'p'},
            {'label': 'Sport', 'code': 's'},
            {'label': 'World', 'code': 'w'},
            {'label': 'Featured Story', 'code': ''},
        ]
    }


def get_previous_versions(item):
    if item.get('ancestors'):
        return list(app.data.find_list_of_ids('wire_search', item['ancestors']))
    return []


@blueprint.route('/')
def index():
    return flask.render_template('wire_index.html', data=get_view_data())


@blueprint.route('/bookmarks')
@login_required
def bookmarks():
    data = get_view_data()
    data['bookmarks'] = True
    return flask.render_template('wire_bookmarks.html', data=data)


@blueprint.route('/search')
def search():
    response = get_internal('wire_search')
    return send_response('wire_search', response)


@blueprint.route('/download/<_ids>')
def download(_ids):
    items = [get_item_or_404(_id) for _id in _ids.split(',')]
    _file = io.BytesIO()
    _format = flask.request.args.get('format', 'text')
    formatter = app.download_formatters[_format]['formatter']
    with zipfile.ZipFile(_file, mode='w') as zf:
        for item in items:
            zf.writestr(
                secure_filename(formatter.format_filename(item)),
                formatter.format_item(item)
            )
    _file.seek(0)
    return flask.send_file(_file, attachment_filename='newsroom.zip', as_attachment=True)


@blueprint.route('/wire_share', methods=['POST'])
@login_required
def share():
    current_user = get_user(required=True)
    data = get_json_or_400()
    assert data.get('users')
    assert data.get('items')
    items = [get_item_or_404(_id) for _id in data.get('items')]
    with app.mail.connect() as connection:
        for user_id in data['users']:
            user = superdesk.get_resource_service('users').find_one(req=None, _id=user_id)
            if not user or not user.get('email'):
                continue
            template_kwargs = {
                'recipient': user,
                'sender': current_user,
                'items': items,
                'message': data.get('message'),
            }
            send_email(
                [user['email']],
                gettext('From %s: %s' % (app.config['SITE_NAME'], items[0]['headline'])),
                flask.render_template('share_item.txt', **template_kwargs),
                sender=current_user['email'],
                connection=connection
            )
    return flask.jsonify(), 201


@blueprint.route('/wire_bookmark', methods=['POST', 'DELETE'])
@login_required
def bookmark():
    """Bookmark an item.

    Stores user id into item.bookmarks array.
    Uses mongodb to update the array and then pushes updated array to elastic.
    """
    user_id = get_user_id()
    data = get_json_or_400()
    assert data.get('items')
    db = app.data.get_mongo_collection('items')
    elastic = app.data._search_backend('items')
    if flask.request.method == 'POST':
        updates = {'$addToSet': {'bookmarks': user_id}}
    else:
        updates = {'$pull': {'bookmarks': user_id}}
    for item_id in data.get('items'):
        result = db.update_one({'_id': item_id}, updates)
        if result.modified_count:
            modified = db.find_one({'_id': item_id})
            elastic.update('items', item_id, {'bookmarks': modified['bookmarks']})
    return flask.jsonify(), 200


@blueprint.route('/wire/<_id>/versions')
def versions(_id):
    item = get_item_or_404(_id)
    items = get_previous_versions(item)
    return flask.jsonify({'_items': items})


@blueprint.route('/wire/<_id>')
def item(_id):
    item = get_item_or_404(_id)
    if flask.request.args.get('format') == 'json':
        return flask.jsonify(item)
    previous_versions = get_previous_versions(item)
    template = 'wire_item_print.html' if 'print' in flask.request.args else 'wire_item.html'
    return flask.render_template(template, item=item, previous_versions=previous_versions)
