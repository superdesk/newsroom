
import newsroom
from planning.events.events_schema import events_schema
from planning.planning.planning import planning_schema
from superdesk.metadata.item import not_analyzed
from planning.common import WORKFLOW_STATE_SCHEMA
from newsroom.wire.search import get_local_date
from eve.utils import ParsedRequest
from flask import json, abort
from newsroom.wire.search import _query_string


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

    # aggregated fields
    schema['genre'] = planning_schema['genre']
    schema['subject'] = planning_schema['subject']
    schema['anpa_category'] = planning_schema['anpa_category']
    schema['priority'] = planning_schema['priority']
    schema['urgency'] = planning_schema['urgency']
    schema['place'] = planning_schema['place']

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
            'coverage_status': not_analyzed,
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


aggregations = {
    'calendar': {'terms': {'field': 'calendars.name', 'size': 20}},
    'location': {'terms': {'field': 'location.name', 'size': 20}},
    'coverage': {'terms': {'field': 'coverages.coverage_type', 'size': 10}},
    'genre': {'terms': {'field': 'genre.name', 'size': 50}},
    'service': {'terms': {'field': 'service.name', 'size': 50}},
    'subject': {'terms': {'field': 'subject.name', 'size': 20}},
    'urgency': {'terms': {'field': 'urgency'}},
    'place': {'terms': {'field': 'place.name', 'size': 50}},
}


def get_aggregation_field(key):
    return aggregations[key]['terms']['field']


def _filter_terms(filters):
    return [{'terms': {get_aggregation_field(key): val}} for key, val in filters.items() if val]


class AgendaService(newsroom.Service):
    def get(self, req, lookup):
        query = _agenda_query()

        if req.args.get('q'):
            query['bool']['must'].append(_query_string(req.args['q']))

        if req.args.get('id'):
            query['bool']['must'].append({'term': {'_id': req.args['id']}})

        if req.args.get('date_from') or req.args.get('date_to'):
            query['bool']['must'].append(_event_date_range(req.args))

        source = {'query': query}
        source['sort'] = [{'versioncreated': 'desc'}]
        source['size'] = 25
        source['from'] = int(req.args.get('from', 0))

        filters = None

        if req.args.get('filter'):
            filters = json.loads(req.args['filter'])

        if filters:
            source['post_filter'] = {'bool': {'must': [_filter_terms(filters)]}}

        if source['from'] >= 1000:
            # https://www.elastic.co/guide/en/elasticsearch/guide/current/pagination.html#pagination
            return abort(400)

        if not source['from']:  # avoid aggregations when handling pagination
            source['aggs'] = aggregations

        internal_req = ParsedRequest()
        internal_req.args = {'source': json.dumps(source)}
        return super().get(internal_req, lookup)
