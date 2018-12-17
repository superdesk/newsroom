
from planning.output_formatters.json_event import JsonEventFormatter
from copy import deepcopy
from flask import json
from newsroom.formatter import BaseFormatter

agenda_remove_fields = {
    'bookmarks',
    'copies',
    'shares',
    'event',
    'event_id',
    'planning_items',
    'display_dates',
    '_id',
    '_updated',
    '_created',
    'priority',
    'event_contact_info',
    'state',
    'version',
    'recurrence_id',
    'guid',
    'ednote',
    'location',
    'definition_short',
    'versioncreated',
    'products',
    'firstcreated',
    'urgency',
    'calendars',
    'abstract',
    'service',
}


class JsonFormatter(BaseFormatter):

    MIMETYPE = 'application/json'
    FILE_EXTENSION = 'json'

    formatter = JsonEventFormatter()

    def format_coverages(self, item):
        for coverage in item.get('coverages', []):
            coverage.pop('delivery_id', None)
            coverage.pop('delivery_href', None)
            coverage.pop('coverage_id', None)
            coverage.pop('coverage_provider', None)
            coverage.pop('planning_id', None)

    def format_item(self, item, item_type='items'):
        if item_type == 'wire':
            raise Exception('Undefined format for wire')

        output_item = deepcopy(item)
        output_item['event_contact_info'] = self.formatter._expand_contact_info(item)
        for f in self.formatter.remove_fields.union(agenda_remove_fields):
            output_item.pop(f, None)

        self.format_coverages(output_item)

        if output_item.get('place'):
            output_item['place'] = [{'name': p.get('name')} for p in output_item.get('place', [])
                                    if p.get('name')]

        if output_item.get('subject'):
            output_item['category'] = [{
                'name': s.get('name')} for s in output_item.get('subject', [])
                if s.get('name')]
        output_item.pop('subject', None)

        if output_item.get('definition_long'):
            output_item['definition'] = output_item.get('definition_long')
        output_item.pop('definition_long', None)

        if output_item.get('genre'):
            output_item['content_type'] = output_item.get('genre')
        output_item.pop('genre', None)

        return json.dumps(output_item, indent=2).encode()
