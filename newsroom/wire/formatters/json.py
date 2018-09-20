
from planning.output_formatters.json_event import JsonEventFormatter
from copy import deepcopy
from flask import json
from newsroom.formatter import BaseFormatter

agenda_remove_fields = {'bookmarks', 'copies', 'shares'}


class JsonFormatter(BaseFormatter):

    MIMETYPE = 'application/json'
    FILE_EXTENSION = 'json'

    formatter = JsonEventFormatter()

    def format_item(self, item, item_type='items'):
        if (item_type == 'wire'):
            raise Exception('Undefined format for wire')

        output_item = deepcopy(item)
        output_item['event_contact_info'] = self.formatter._expand_contact_info(item)
        for f in self.formatter.remove_fields.union(agenda_remove_fields):
            output_item.pop(f, None)

        return json.dumps(output_item, indent=2).encode()
