
from planning.output_formatters.json_event import JsonEventFormatter
from planning.output_formatters.utils import expand_contact_info
from copy import deepcopy
from flask import json
from .base import BaseFormatter

agenda_json_fields = [
    'name',
    'slugline',
    'headline',
    'definition',
    'dates',
    'coverages',
    'service',
    'category',
    'place',
    'content_type',
]


class JsonFormatter(BaseFormatter):

    MIMETYPE = 'application/json'
    FILE_EXTENSION = 'json'

    formatter = JsonEventFormatter()

    def format_coverages(self, item):
        fields = ['coverages', 'delivery_id', 'delivery_href', 'deliveries', 'coverage_id', 'coverage_provider',
                  'planning_id']
        for coverage in item.get('coverages', []):
            for field in fields:
                coverage.pop(field, None)

    def format_item(self, item, item_type='items'):
        if item_type == 'wire':
            raise Exception('Undefined format for wire')

        output_item = deepcopy(item)
        output_item['event_contact_info'] = expand_contact_info(item.get('event_contact_info', []))

        self.format_coverages(output_item)

        if output_item.get('place'):
            output_item['place'] = [{'name': p.get('name')} for p in output_item.get('place', [])
                                    if p.get('name')]

        if output_item.get('subject'):
            output_item['category'] = [{
                'name': s.get('name')} for s in output_item.get('subject', [])
                if s.get('name')]

        if output_item.get('definition_long'):
            output_item['definition'] = output_item.get('definition_long')

        if output_item.get('genre'):
            output_item['content_type'] = output_item.get('genre')

        filtered_output_item = {k: output_item[k] for k in agenda_json_fields if k in output_item}

        return json.dumps(filtered_output_item, indent=2).encode()
