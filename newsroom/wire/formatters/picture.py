import mimetypes
from newsroom.wire.formatters.base import BaseFormatter
from newsroom.wire.utils import get_picture


class PictureFormatter(BaseFormatter):

    MIMETYPE = 'image/jpeg'
    MEDIATYPE = 'picture'

    ALLOWED_EXTENSIONS = ['.jpg', '.png']

    def update_extension(self):
        extensions = mimetypes.guess_all_extensions(self.MIMETYPE, strict=True)
        for extension in extensions:
            if extension in self.ALLOWED_EXTENSIONS:
                return extension

        raise ValueError('Undefined extension')

    def format_item(self, item, item_type='items'):
        if item_type == 'agenda':
            raise TypeError('Undefined format for agenda')

        picture = get_picture(item)

        if not picture:
            raise ValueError('Undefined picture')

        picture_details = picture.get('renditions', {}).get('baseImage', {})
        self.MIMETYPE = picture_details.get('mimetype', 'image/jpeg')
        picture_details['file_extension'] = self.update_extension()

        return picture_details
