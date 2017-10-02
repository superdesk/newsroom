import io
import flask
import zipfile
import superdesk

from eve.render import send_response
from eve.methods.get import get_internal
from werkzeug.utils import secure_filename

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


@blueprint.route('/download/<_id>')
def download(_id):
    item = superdesk.get_resource_service('items').find_one(req=None, _id=_id)
    if not item:
        flask.abort(404)
    _file = io.BytesIO()
    with zipfile.ZipFile(_file, mode='w') as zf:
        zf.writestr(
            secure_filename('{}.txt'.format(item['_id'])),
            str.encode(flask.render_template('download_item.txt', item=item), 'utf-8')
        )
    _file.seek(0)
    return flask.send_file(_file, attachment_filename='newsroom.zip', as_attachment=True)
