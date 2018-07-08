
import flask


class TextFormatter():

    def format_filename(self, item):
        return '{}.txt'.format(item['_id'])

    def format_item(self, item, item_type='items'):
        if item_type == 'items':
            return str.encode(flask.render_template('download_item.txt', item=item), 'utf-8')
        else:
            return str.encode(flask.render_template('download_agenda.txt', item=item), 'utf-8')
