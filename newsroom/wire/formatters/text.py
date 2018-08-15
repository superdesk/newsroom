
import flask
from .base import BaseFormatter


class TextFormatter(BaseFormatter):

    FILE_EXTENSION = 'txt'
    MIMETYPE = 'text/plain'

    def format_item(self, item):
        return str.encode(flask.render_template('download_item.txt', item=item), 'utf-8')
