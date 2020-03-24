
from superdesk.utc import utcnow
from . import FormatterRegistry


class BaseFormatter(metaclass=FormatterRegistry):

    MIMETYPE = None
    FILE_EXTENSION = None
    MEDIATYPE = 'text'

    def format_filename(self, item):
        assert self.FILE_EXTENSION
        _id = (item.get('slugline', item['_id']) or item['_id']).replace(' ', '-').lower()
        timestamp = item.get('versioncreated', item.get('_updated', utcnow()))
        return '{timestamp}-{_id}.{ext}'.format(
            timestamp=timestamp.strftime('%Y%m%d%H%M'),
            _id=_id.lower(),
            ext=self.FILE_EXTENSION)

    def get_mimetype(self, item):
        return self.MIMETYPE

    def get_mediatype(self):
        return self.MEDIATYPE
