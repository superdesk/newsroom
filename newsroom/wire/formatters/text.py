
import flask


class TextFormatter():

    def format_filename(self, item):
        return '{}.txt'.format(item['_id'])

    def format_item(self, item):
        return str.encode(flask.render_template('download_item.txt', item=item), 'utf-8')
