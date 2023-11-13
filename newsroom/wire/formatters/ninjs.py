import flask
import json
from .base import BaseFormatter
from superdesk.utils import json_serialize_datetime_objectId
from newsroom.utils import remove_all_embeds


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

    @staticmethod
    def test_for_true(value):
        """
        Test if the value indicates false
        :param value:
        :return:
        """
        return value.lower() == 'true' or value == '1'

    def _transform_to_ninjs(self, item):
        no_embeds = flask.request.args.get('no_embeds', default=False, type=self.test_for_true)
        no_media = flask.request.args.get('no_media', default=False, type=self.test_for_true)
        if no_media or no_embeds:
            remove_all_embeds(item, remove_media_embeds=no_media, remove_by_class=no_embeds)

        ninjs = {
            'guid': item.get('_id'),
            'version': str(item.get('version', 1)),
            'type': 'text'
        }

        for copy_property in self.direct_copy_properties:
            if item.get(copy_property) is not None:
                ninjs[copy_property] = item[copy_property]

        return ninjs
