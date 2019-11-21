
import flask
from werkzeug.utils import secure_filename
from newsroom.wire.formatters.base import BaseFormatter
from superdesk.utc import utcnow


class WatchListFormatter(BaseFormatter):

    FILE_EXTENSION = 'txt'
    MIMETYPE = 'text/plain'

    def format_item(self, item, item_type='items'):
        return str.encode(flask.render_template('watch_list_export.txt', items=item), 'utf-8')

    def format_filename(self, item):
        attachment_filename = '%s-watch-list-export.txt' % utcnow().strftime('%Y%m%d%H%M%S')
        return secure_filename(attachment_filename)
