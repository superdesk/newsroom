import json
from .base import BaseFormatter
from superdesk.utils import json_serialize_datetime_objectId


class NINJSFormatter(BaseFormatter):
    MIMETYPE = 'application/json'
    FILE_EXTENSION = 'json'

    direct_copy_properties = ('versioncreated', 'usageterms', 'language', 'headline', 'copyrightnotice',
                              'urgency', 'pubstatus', 'mimetype', 'copyrightholder', 'ednote',
                              'body_text', 'body_html', 'slugline', 'keywords',
                              'firstcreated', 'firstpublished', 'source', 'extra', 'annotations', 'located', 'byline',
                              'description_html', 'place', 'embargoed', 'priority', 'genre', 'service', 'subject',
                              'evolvedfrom', 'decsription_text')

    def format_item(self, item, item_type='items'):
        item = item.copy()
        ninjs = self._transform_to_ninjs(item)

        return json.dumps(ninjs, default=json_serialize_datetime_objectId)

    def _transform_to_ninjs(self, item):
        ninjs = {
            'guid': item.get('_id'),
            'version': str(item.get('version', 1)),
            'type': 'text'
        }

        for copy_property in self.direct_copy_properties:
            if item.get(copy_property) is not None:
                ninjs[copy_property] = item[copy_property]

        return ninjs
