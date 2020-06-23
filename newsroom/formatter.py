
from werkzeug.utils import secure_filename
from superdesk.utc import utcnow


class BaseFormatter():
    """Base formatter class.

    Extend it to implement custom formatter.
    """

    #: Response mime type when downloading single file (eg. ``text/plain``).
    MIMETYPE = None

    #: Tyoe of the output content ['text', 'picture']
    MEDIATYPE = None

    #: File extension to use for downloaded file.
    FILE_EXTENSION = None

    def format_item(self, item, item_type=None, items=[]):
        raise NotImplementedError

    def format_filename(self, item):
        assert self.FILE_EXTENSION
        _id = (item.get('slugline', item['_id']) or item['_id']).replace(' ', '-').lower()
        timestamp = item.get('versioncreated', item.get('_updated', utcnow()))
        return secure_filename('{timestamp}-{_id}.{ext}'.format(
            timestamp=timestamp.strftime('%Y%m%d%H%M'),
            _id=_id,
            ext=self.FILE_EXTENSION))

    def get_mimetype(self, item):
        return self.MIMETYPE

    def get_mediatype(self):
        return self.MEDIATYPE
