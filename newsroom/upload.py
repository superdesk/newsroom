
import flask
import newsroom
import bson.errors

from werkzeug.wsgi import wrap_file
from superdesk.upload import upload_url as _upload_url
from newsroom.auth import login_required


cache_for = 3600 * 24 * 7  # 7 days cache
ASSETS_RESOURCE = 'upload'
blueprint = flask.Blueprint(ASSETS_RESOURCE, __name__)


@blueprint.route('/assets/<path:media_id>', methods=['GET'])
@login_required
def get_upload(media_id):
    try:
        media_file = flask.current_app.media.get(media_id, ASSETS_RESOURCE)
    except bson.errors.InvalidId:
        media_file = None
    if not media_file:
        flask.abort(404)

    data = wrap_file(flask.request.environ, media_file, buffer_size=1024 * 256)
    response = flask.current_app.response_class(
        data,
        mimetype=media_file.content_type,
        direct_passthrough=True)
    response.content_length = media_file.length
    response.last_modified = media_file.upload_date
    response.set_etag(media_file.md5)
    response.cache_control.max_age = cache_for
    response.cache_control.s_max_age = cache_for
    response.cache_control.public = True
    response.make_conditional(flask.request)
    response.headers['Content-Disposition'] = 'inline'
    return response


def upload_url(media_id):
    return _upload_url(media_id, view='assets.get_media_streamed')


def init_app(app):
    app.upload_url = upload_url
    app.config['DOMAIN'].setdefault('upload', {
        'authentication': None,
        'mongo_prefix': newsroom.MONGO_PREFIX,
    })
