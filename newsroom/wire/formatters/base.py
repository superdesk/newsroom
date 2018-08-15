
from werkzeug.utils import secure_filename
from superdesk.utc import utcnow


class BaseFormatter():

    MIMETYPE = None
    FILE_EXTENSION = None

    def format_filename(self, item):
        assert self.FILE_EXTENSION
        _id = item.get('slugline', item['_id']).replace(' ', '-').lower()
        timestamp = item.get('versioncreated', item.get('_updated', utcnow()))
        return secure_filename('{timestamp}-{_id}.{ext}'.format(
            timestamp=timestamp.strftime('%Y%m%d%H%M'),
            _id=_id,
            ext=self.FILE_EXTENSION))

    def get_mimetype(self, item):
        return self.MIMETYPE
