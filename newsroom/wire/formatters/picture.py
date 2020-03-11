from newsroom.wire.formatters.base import BaseFormatter
from newsroom.wire.utils import get_picture


class PictureFormatter(BaseFormatter):

    MIMETYPE = 'image/jpeg'
    FILE_EXTENSION = 'jpg'

    def format_item(self, item, item_type='items'):
        if item_type == 'agenda':
            raise TypeError('Undefined format for agenda')

        picture = get_picture(item)

        if not picture:
            raise TypeError('Undefined picture')

        return picture.get('renditions', {}).get('baseImage', {}).get('media')
