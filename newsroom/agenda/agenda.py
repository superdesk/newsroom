
import newsroom
from planning.events.events_schema import events_schema
from planning.planning.planning import planning_schema
from superdesk.metadata.item import not_analyzed
from planning.common import WORKFLOW_STATE_SCHEMA
from newsroom.wire.search import get_local_date
from eve.utils import ParsedRequest
from flask import json


class AgendaResource(newsroom.Resource):
    """
    Agenda schema
    """
    schema = {}

    # identifiers
    schema['event_id'] = events_schema['guid']
    schema['recurrence_id'] = {
        'type': 'string',
        'mapping': not_analyzed,
        'nullable': True,
    }

    # content metadata
    schema['name'] = events_schema['name']
    schema['slugline'] = not_analyzed
    schema['definition_long'] = events_schema['definition_long']
    schema['abstract'] = planning_schema['abstract']
    schema['headline'] = planning_schema['headline']
    schema['firstcreated'] = events_schema['firstcreated']
    schema['versioncreated'] = events_schema['versioncreated']
    schema['ednote'] = events_schema['ednote']

    # dates
    schema['dates'] = {
        'type': 'dict',
        'schema': {
            'start': {'type': 'datetime'},
            'end': {'type': 'datetime'},
            'tz': {'type': 'string'},
        }
    }

    # coverages
    schema['coverages'] = {
        'type': 'nested',
        'properties': {
            'planning_id': not_analyzed,
            'coverage_id': not_analyzed,
            'scheduled': {'type': 'datetime'},
            'coverage_type': not_analyzed,
            'workflow_status': not_analyzed,
            'news_coverage_status': not_analyzed,
            'coverage_provider': not_analyzed,
        }
    }

    # state
    schema['state'] = WORKFLOW_STATE_SCHEMA

    # other searchable fields needed in UI
    schema['calendars'] = events_schema['calendars']
    schema['location'] = events_schema['location']

    # event details
    schema['event'] = events_schema

    # planning details which can be more than one per event
    schema['planning_items'] = {
        'type': 'list',
        'schema': planning_schema,
    }

    resource_methods = ['GET']
    datasource = {
        'source': 'agenda',
        'search_backend': 'elastic',
        'default_sort': [('versioncreated', 1)],
    }
    item_methods = ['GET']


def _agenda_query():
    return {
        'bool': {
            'must': [{'term': {'_type': 'agenda'}}],
        }
    }


def _event_date_range(args):
    _range = {}
    offset = int(args.get('timezone_offset', '0'))
    if args.get('date_from'):
        _range['gte'] = get_local_date(args['date_from'], '00:00:00', offset)
    if args.get('date_to'):
        _range['lte'] = get_local_date(args['date_to'], '23:59:59', offset)
    return {'range': {'dates.start': _range}}


class AgendaService(newsroom.Service):
    def get(self, req, lookup):
        query = _agenda_query()

        if req.args.get('date_from') or req.args.get('date_to'):
            query['bool']['must'].append(_event_date_range(req.args))

        source = {'query': query}
        source['sort'] = [{'versioncreated': 'desc'}]
        source['size'] = 25
        source['from'] = int(req.args.get('from', 0))

        internal_req = ParsedRequest()
        internal_req.args = {'source': json.dumps(source)}
        return super().get(internal_req, lookup)
