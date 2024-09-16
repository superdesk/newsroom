import flask
import newsroom
import bson.errors

from werkzeug.wsgi import wrap_file
from werkzeug.http import parse_range_header
from werkzeug.utils import secure_filename
from flask import request, url_for, current_app as newsroom_app
from superdesk.upload import upload_url as _upload_url
from superdesk import get_resource_service
from newsroom.decorator import login_required

cache_for = 3600 * 24 * 7  # 7 days cache
ASSETS_RESOURCE = 'upload'
blueprint = flask.Blueprint(ASSETS_RESOURCE, __name__)


class MediaFileLoader:
    _loaded_files = {}

    @classmethod
    def get_media_file(cls, media_id):
        if media_id in cls._loaded_files:
            return cls._loaded_files[media_id]

        media_file = flask.current_app.media.get(media_id, ASSETS_RESOURCE)

        if media_file and 'video' in media_file.content_type:
            cls._loaded_files[media_id] = media_file

        return media_file


def get_file(key):
    file = request.files.get(key)
    if file:
        filename = secure_filename(file.filename)
        newsroom_app.media.put(file, resource=ASSETS_RESOURCE, _id=filename, content_type=file.content_type)
        return url_for('upload.get_upload', media_id=filename)


@blueprint.route('/assets/<path:media_id>', methods=['GET'])
@login_required
def get_upload(media_id):
    is_safari = ('Safari' in request.headers.get('User-Agent', '') and 'Chrome'
                 not in request.headers.get('User-Agent', ''))
    try:
        if is_safari:
            media_file = flask.current_app.media.get(media_id, ASSETS_RESOURCE)
        else:
            media_file = MediaFileLoader.get_media_file(media_id)
    except bson.errors.InvalidId:
        media_file = None
    if not media_file:
        flask.abort(404, description="File not found")

    file_size = media_file.length
    content_type = media_file.content_type or 'application/octet-stream'
    range_header = request.headers.get('Range')
    if not is_safari and range_header:
        try:
            ranges = parse_range_header(range_header)
            if ranges and len(ranges.ranges) == 1:
                start, end = ranges.ranges[0]
                if start is None:
                    flask.abort(416, description="Invalid range header")
                if end is None or end >= file_size:
                    end = file_size - 1
                length = end - start + 1

                def range_generate():
                    media_file.seek(start)
                    remaining = length
                    chunk_size = 8192
                    while remaining:
                        chunk = media_file.read(min(chunk_size, remaining))
                        if not chunk:
                            break
                        remaining -= len(chunk)
                        yield chunk

                response = flask.Response(
                    flask.stream_with_context(range_generate()),
                    206,
                    mimetype=content_type,
                    direct_passthrough=True,
                )
                response.headers.add('Content-Range', f'bytes {start}-{end}/{file_size}')
                response.headers.add('Accept-Ranges', 'bytes')
                response.headers.add('Content-Length', str(length))
            else:
                flask.abort(416, description="Requested range not satisfiable")
        except ValueError:
            flask.abort(400, description="Invalid range header")
    else:
        data = wrap_file(flask.request.environ, media_file, buffer_size=1024 * 256)
        response = flask.current_app.response_class(
            data,
            mimetype=media_file.content_type,
            direct_passthrough=True)
        response.content_length = media_file.length

    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers.pop('Content-Disposition', None)
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.last_modified = media_file.upload_date
    response.set_etag(media_file.md5)
    response.cache_control.max_age = cache_for
    response.cache_control.s_max_age = cache_for
    response.cache_control.public = True
    response.make_conditional(flask.request)

    if request.args.get('filename'):
        response.headers['Content-Disposition'] = f'attachment; filename="{request.args["filename"]}"'
    else:
        response.headers['Content-Disposition'] = 'inline'

    item_id = request.args.get('item_id')
    if item_id:
        try:
            get_resource_service('history').log_media_download(item_id, media_id)
        except Exception as e:
            newsroom_app.logger.error(f"Error logging media download: {str(e)}")

    return response


def upload_url(media_id):
    return _upload_url(media_id, view='assets.get_media_streamed')


def init_app(app):
    app.upload_url = upload_url
    app.config['DOMAIN'].setdefault('upload', {
        'authentication': None,
        'mongo_prefix': newsroom.MONGO_PREFIX,
        'internal_resource': True
    })
