import flask
from .base import BaseFormatter
from newsroom.utils import remove_all_embeds


class HTMLFormatter(BaseFormatter):
    """
    Formatter that allows the download of "plain" html with any embeds in the html body stripped
    """

    FILE_EXTENSION = 'html'
    MIMETYPE = 'text/html'

    def format_item(self, item, item_type='items'):
        remove_all_embeds(item)

        if item_type == 'items':
            return str.encode(flask.render_template('download_item.html', item=item), 'utf-8')
        else:
            return str.encode(flask.render_template('download_agenda.txt', item=item), 'utf-8')
