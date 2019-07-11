import logging

from copy import deepcopy
from content_api.items.resource import code_mapping
from eve.utils import ParsedRequest, config
from flask import json, abort, url_for, current_app as app
from flask_babel import gettext
from planning.common import WORKFLOW_STATE_SCHEMA, ASSIGNMENT_WORKFLOW_STATE, WORKFLOW_STATE
from planning.events.events_schema import events_schema
from planning.planning.planning import planning_schema
from superdesk import get_resource_service
from superdesk.resource import Resource, not_enabled, not_analyzed, not_indexed
from superdesk.utils import ListCursor

import newsroom
from newsroom.agenda.email import send_coverage_notification_email, send_agenda_notification_email
from newsroom.auth import get_user
from newsroom.companies import get_user_company
from newsroom.notifications import push_notification
from newsroom.template_filters import is_admin_or_internal, is_admin
from newsroom.utils import get_user_dict, get_company_dict, get_entity_or_404
from newsroom.wire.search import query_string, set_product_query, \
    planning_items_query_string, nested_query
from newsroom.wire.utils import get_local_date, get_end_date
from datetime import datetime
from newsroom.wire import url_for_wire
from .utils import get_latest_available_delivery


logger = logging.getLogger(__name__)
PRIVATE_FIELDS = [
    'event.files',
    'event.internal_note',
    'planning_items.internal_note',
    'coverages.planning.internal_note'
]
PLANNING_ITEMS_FIELDS = [
    'planning_items',
    'coverages',
    'display_dates'
]


agenda_notifications = {
    'event_updated': {
        'message': gettext('An event you have been watching has been updated'),
        'subject': gettext('Event updated')
    },
    'event_unposted': {
        'message': gettext('An event you have been watching has been cancelled'),
        'subject': gettext('Event cancelled')
    },
    'planning_added': {
        'message': gettext('An event you have been watching has a new planning'),
        'subject': gettext('Planning added')
    },
    'planning_cancelled': {
        'message': gettext('An event you have been watching has a planning cancelled'),
        'subject': gettext('Planning cancelled')
    },
    'coverage_added': {
        'message': gettext('An event you have been watching has a new coverage added'),
        'subject': gettext('Coverage added')
    },
}


def set_saved_items_query(query, user_id):
    query['bool']['must'].append({
        'bool': {
            'should': [
                {'term': {'bookmarks': str(user_id)}},
                {'term': {'watches': str(user_id)}},
            ],
        },
    })


class AgendaResource(newsroom.Resource):
    """
    Agenda schema
    """
    schema = {}

    # identifiers
    schema['guid'] = events_schema['guid']
    schema['type'] = {
        'type': 'string',
        'mapping': not_analyzed,
        'default': 'agenda',
    }
    schema['event_id'] = events_schema['guid']
    schema['recurrence_id'] = {
        'type': 'string',
        'mapping': not_analyzed,
        'nullable': True,
    }

    # content metadata
    schema['name'] = events_schema['name']
    schema['slugline'] = not_analyzed
    schema['definition_short'] = events_schema['definition_short']
    schema['definition_long'] = events_schema['definition_long']
    schema['headline'] = planning_schema['headline']
    schema['firstcreated'] = events_schema['firstcreated']
    schema['version'] = events_schema['version']
    schema['versioncreated'] = events_schema['versioncreated']
    schema['ednote'] = events_schema['ednote']

    # aggregated fields
    schema['subject'] = planning_schema['subject']
    schema['urgency'] = planning_schema['urgency']
    schema['place'] = planning_schema['place']
    schema['service'] = code_mapping
    schema['state_reason'] = {'type': 'string'}

    # dates
    schema['dates'] = {
        'type': 'dict',
        'schema': {
            'start': {'type': 'datetime'},
            'end': {'type': 'datetime'},
            'tz': {'type': 'string'},
        }
    }

    # additional dates from coverages or planning to be used in searching agenda items
    schema['display_dates'] = {
        'type': 'list',
        'nullable': True,
        'schema': {
            'type': 'dict',
            'schema': {
                'date': {'type': 'datetime'},
            }
        }
    }

    # coverages
    schema['coverages'] = {
        'type': 'object',
        'mapping': {
            'type': 'nested',
            'properties': {
                'planning_id': not_analyzed,
                'coverage_id': not_analyzed,
                'scheduled': {'type': 'date'},
                'coverage_type': not_analyzed,
                'workflow_status': not_analyzed,
                'coverage_status': not_analyzed,
                'coverage_provider': not_analyzed,
                'slugline': not_analyzed,
                'delivery_id': not_analyzed,  # To point ot the latest published item
                'delivery_href': not_analyzed,  # To point ot the latest published item
                'deliveries': {  # All deliveries (incl. updates go here)
                    'type': 'object',
                    'properties': {
                        'planning_id': not_analyzed,
                        'coverage_id': not_analyzed,
                        'assignment_id': not_analyzed,
                        'item_id': not_analyzed,
                        'item_state': not_analyzed,
                        'sequence_no': not_analyzed,
                        'publish_time': {'type': 'date'},
                    }

                },
            },
        },
    }

    # attachments
    schema['files'] = {
        'type': 'list',
        'mapping': not_enabled,
    }

    # state
    schema['state'] = WORKFLOW_STATE_SCHEMA

    # other searchable fields needed in UI
    schema['calendars'] = events_schema['calendars']
    schema['location'] = events_schema['location']

    # update location name to be not_analyzed
    schema['location']['mapping']['properties']['name'] = not_analyzed

    # event details
    schema['event'] = {
        'type': 'object',
        'mapping': not_enabled,
    }

    # planning details which can be more than one per event
    schema['planning_items'] = {
        'type': 'list',
        'mapping': {
            'type': 'nested',
            'include_in_all': False,
            'properties': {
                '_id': not_analyzed,
                'guid': not_analyzed,
                'slugline': not_analyzed,
                'description_text': {'type': 'string'},
                'headline': {'type': 'string'},
                'abstract': {'type': 'string'},
                'subject': code_mapping,
                'urgency': {'type': 'integer'},
                'service': code_mapping,
                'planning_date': {'type': 'date'},
                'coverages': not_enabled,
                'agendas': {
                    'type': 'object',
                    'properties': {
                        'name': not_analyzed,
                        '_id': not_analyzed,
                    }
                },
                'ednote': {'type': 'string'},
                'internal_note': not_indexed,
                'place': planning_schema['place']['mapping'],
                'state': not_analyzed,
                'state_reason': {'type': 'string'},
                'products': {
                    'type': 'object',
                    'properties': {
                        'code': not_analyzed,
                        'name': not_analyzed
                    }
                }
            }
        }
    }

    schema['bookmarks'] = Resource.not_analyzed_field('list')  # list of user ids who bookmarked this item
    schema['downloads'] = Resource.not_analyzed_field('list')  # list of user ids who downloaded this item
    schema['shares'] = Resource.not_analyzed_field('list')  # list of user ids who shared this item
    schema['prints'] = Resource.not_analyzed_field('list')  # list of user ids who printed this item
    schema['copies'] = Resource.not_analyzed_field('list')  # list of user ids who copied this item
    schema['watches'] = Resource.not_analyzed_field('list')  # list of users following the event

    # matching products from superdesk
    schema['products'] = {
        'type': 'list',
        'mapping': {
            'type': 'object',
            'properties': {
                'code': not_analyzed,
                'name': not_analyzed
            }
        }
    }

    resource_methods = ['GET']
    datasource = {
        'source': 'agenda',
        'search_backend': 'elastic',
        'default_sort': [('dates.start', 1)],
    }

    item_methods = ['GET']


def _agenda_query():
    return {
        'bool': {
            'must': [{'term': {'_type': 'agenda'}}],
            'should': [],
            'must_not': [{'term': {'state': 'killed'}}],
            'minimum_should_match': 1,
        }
    }


def get_date_filters(args):
    range = {}
    offset = int(args.get('timezone_offset', '0'))
    if args.get('date_from'):
        range['gt'] = get_local_date(args['date_from'], '00:00:00', offset)
    if args.get('date_to'):
        range['lt'] = get_end_date(args['date_to'], get_local_date(args['date_to'], '23:59:59', offset))
    return range


def _event_date_range(args):
    """Get events for selected date.

    ATM it should display everything not finished by that date, even starting later.
    """
    date_range = get_date_filters(args)
    date_query = []
    if date_range.get('gt') and date_range.get('lt'):
        date_query.append({'range': {'dates.end': date_range}})
        date_query.append({'range': {'dates.start': date_range}})
        date_query.append({
            'bool': {
                'must': [
                    {'range': {'dates.start': {'lt': date_range.get('gt')}}},
                    {'range': {'dates.end': {'gt': date_range.get('lt')}}}
                ]
            }
        })
    else:
        date_query.append({'range': {'dates.end': get_date_filters(args)}})
    return date_query


def _display_date_range(args):
    """Get events for extra dates for coverages and planning.
    """
    return {'range': {'display_dates.date': get_date_filters(args)}}


aggregations = {
    'calendar': {'terms': {'field': 'calendars.name', 'size': 0}},
    'location': {'terms': {'field': 'location.name', 'size': 0}},
    'service': {'terms': {'field': 'service.name', 'size': 50}},
    'subject': {'terms': {'field': 'subject.name', 'size': 20}},
    'urgency': {'terms': {'field': 'urgency'}},
    'place': {'terms': {'field': 'place.name', 'size': 50}},
    'coverage': {
        'nested': {'path': 'coverages'},
        'aggs': {'coverage_type': {'terms': {'field': 'coverages.coverage_type', 'size': 10}}}},
    'planning_items': {
        'nested': {
            'path': 'planning_items',
        },
        'aggs': {
            'service': {'terms': {'field': 'planning_items.service.name', 'size': 50}},
            'subject': {'terms': {'field': 'planning_items.subject.name', 'size': 20}},
            'urgency': {'terms': {'field': 'planning_items.urgency'}},
            'place': {'terms': {'field': 'planning_items.place.name', 'size': 50}}
        },
    }
}


def get_agenda_aggregations(events_only=False):
    aggs = deepcopy(aggregations)
    if events_only:
        aggs.pop('coverage', None)
        aggs.pop('planning_items', None)
        aggs.pop('urgency', None)
    return aggs


def get_aggregation_field(key):
    if key == 'coverage':
        return aggregations[key]['aggs']['coverage_type']['terms']['field']
    return aggregations[key]['terms']['field']


def _filter_terms(filters, events_only=False):
    must_term_filters = []
    must_not_term_filters = []
    for key, val in filters.items():
        if val and key != 'coverage' and key != 'coverage_status':
            if key in {'service', 'urgency', 'subject', 'place'} and not events_only:
                must_term_filters.append({
                    'or': [
                        {'terms': {get_aggregation_field(key): val}},
                        nested_query(
                            'planning_items',
                            {
                                'bool': {
                                    'must': [
                                        {'terms': {'planning_items.{}'.format(get_aggregation_field(key)): val}}
                                    ]
                                }
                            },
                            name=key
                        )
                    ]
                })
            else:
                must_term_filters.append({'terms': {get_aggregation_field(key): val}})
        if val and key == 'coverage' and not events_only:
            must_term_filters.append(
                {"nested": {
                    "path": "coverages",
                    "query": {"bool": {"must": [{'terms': {get_aggregation_field(key): val}}]}}
                }})
        if val and key == 'coverage_status' and not events_only:
            if val == ['planned']:
                must_term_filters.append(
                    {"nested": {
                        "path": "coverages",
                        "query": {"bool": {"must": [{'terms': {'coverages.coverage_status': ['coverage intended']}}]}}
                    }})
            else:
                must_not_term_filters.append(
                    {"nested": {
                        "path": "coverages",
                        "query": {"bool": {
                            "should": [
                                {'terms': {'coverages.coverage_status': ['coverage intended']}}
                            ]}}
                    }})

    return {"must_term_filters": must_term_filters, "must_not_term_filters": must_not_term_filters}


def _remove_fields(source, fields):
    """Add fields to remove the elastic search

    :param dict source: elasticsearch query object
    :param fields: list of fields
    """
    if not source.get('_source'):
        source['_source'] = {}

    if not source.get('_source').get('exclude'):
        source['_source']['exclude'] = []

    source['_source']['exclude'].extend(fields)


def set_post_filter(source, req, events_only=False):
    filters = None
    if req.args.get('filter'):
        filters = json.loads(req.args['filter'])
    if filters:
        if app.config.get('FILTER_BY_POST_FILTER', False):
            source['post_filter'] = {'bool': {
                'must': [_filter_terms(filters, events_only)['must_term_filters']],
                'must_not': [_filter_terms(filters, events_only)['must_not_term_filters']],
            }}
        else:
            source['query']['bool']['must'] += _filter_terms(filters, events_only)['must_term_filters']
            source['query']['bool']['must_not'] += _filter_terms(filters, events_only)['must_not_term_filters']


def get_agenda_query(query, events_only=False):
    if events_only:
        return query_string(query)
    else:
        return {
            'or': [
                query_string(query),
                nested_query(
                    'planning_items',
                    planning_items_query_string(query),
                    name='query'
                )
            ]
        }


def is_events_only_access(user, company):
    if user and company and not is_admin(user):
        return company.get('events_only', False)
    return False


def filter_active_users(user_ids, user_dict, company_dict, events_only=False):
    active = []
    for _id in user_ids:
        user = user_dict.get(str(_id))
        if user and (not user.get('company') or str(user.get('company', '')) in company_dict):
            if events_only and user.get('company') and \
                    (company_dict.get(str(user.get('company', ''))) or {}).get('events_only'):
                continue
            active.append(_id)
    return active


class AgendaService(newsroom.Service):
    section = 'agenda'

    def on_fetched(self, doc):
        self.enhance_items(doc[config.ITEMS])

    def on_fetched_item(self, doc):
        self.enhance_items([doc])

    def enhance_items(self, docs):
        for doc in docs:
            # Enhance completed coverages in general - add story's abstract/headline/slugline
            delivery_ids = [c.get('delivery_id') for c in (doc.get('coverages') or [])
                            if c.get('delivery_id') and c['workflow_status'] == ASSIGNMENT_WORKFLOW_STATE.COMPLETED]
            wire_search_service = get_resource_service('wire_search')
            if delivery_ids:
                wire_items = wire_search_service.get_items(delivery_ids)
                if wire_items.count() > 0:
                    for item in wire_items:
                        c = [c for c in doc.get('coverages') if c.get('delivery_id') == item.get('_id')][0]
                        self.enhance_coverage_with_wire_details(c, item)

            # Filter based on _inner_hits
            inner_hits = doc.pop('_inner_hits', None)
            if not inner_hits or not doc.get('planning_items'):
                continue

            items_by_key = {item.get('guid') for key, items in inner_hits.items() for item in items}
            if not items_by_key:
                continue
            doc['planning_items'] = [p for p in doc['planning_items'] or [] if p.get('guid') in items_by_key]
            doc['coverages'] = [c for c in (doc.get('coverages') or []) if c.get('planning_id') in items_by_key]

    def enhance_coverage_with_wire_details(self, coverage, wire_item):
        coverage['item_description_text'] = wire_item.get('description_text')
        coverage['item_headline'] = wire_item.get('headline')
        coverage['item_slugline'] = wire_item.get('slugline')
        coverage['publish_time'] = wire_item.get('publish_schedule') or wire_item.get('firstpublished')
        if wire_item.get('ednote'):
            coverage['item_ednote'] = wire_item.get('ednote')

    def get(self, req, lookup):
        if req.args.get('featured'):
            return self.get_featured_stories(req, lookup)

        query = _agenda_query()
        user = get_user()
        company = get_user_company(user)
        is_events_only = is_events_only_access(user, company) or req.args.get('eventsOnlyView')
        get_resource_service('section_filters').apply_section_filter(query, self.section)
        product_query = {'bool': {'must': [], 'should': []}}

        set_product_query(
            product_query,
            company,
            self.section,
            navigation_id=req.args.get('navigation'),
            events_only=is_events_only
        )
        query['bool']['must'].append(product_query)

        if req.args.get('q'):
            test_query = {'or': []}
            try:
                q = json.loads(req.args.get('q'))
                if isinstance(q, dict):
                    # used for product testing
                    if q.get('query'):
                        test_query['or'].append(query_string(q.get('query')))
                    if q.get('planning_item_query'):
                        test_query['or'].append(
                            nested_query(
                                'planning_items',
                                planning_items_query_string(q.get('planning_item_query')),
                                name='product_test'
                            )
                        )
                    if test_query['or']:
                        query['bool']['must'].append(test_query)
            except Exception:
                pass

            if not test_query.get('or'):
                query['bool']['must'].append(get_agenda_query(req.args['q'], is_events_only))

        if req.args.get('id'):
            query['bool']['must'].append({'term': {'_id': req.args['id']}})

        if req.args.get('bookmarks'):
            set_saved_items_query(query, req.args['bookmarks'])

        if req.args.get('date_from') or req.args.get('date_to'):
            query['bool']['should'].extend(_event_date_range(req.args))
            if not is_events_only:
                query['bool']['should'].append(_display_date_range(req.args))

        source = {'query': query}
        source['sort'] = [{'dates.start': 'asc'}]
        source['size'] = 100  # we should fetch all items for given date
        source['from'] = req.args.get('from', 0, type=int)

        set_post_filter(source, req, is_events_only)

        if source['from'] >= 1000:
            # https://www.elastic.co/guide/en/elasticsearch/guide/current/pagination.html#pagination
            return abort(400)

        if not source['from'] and not req.args.get('bookmarks'):  # avoid aggregations when handling pagination
            source['aggs'] = get_agenda_aggregations(is_events_only)

        if not is_admin_or_internal(user):
            _remove_fields(source, PRIVATE_FIELDS)

        if is_events_only:
            # no adhoc planning items and remove planning items and coverages fields
            query['bool']['must'].append({'exists': {'field': 'event_id'}})
            _remove_fields(source, PLANNING_ITEMS_FIELDS)

        internal_req = ParsedRequest()
        internal_req.args = {'source': json.dumps(source)}
        cursor = super().get(internal_req, lookup)

        if req.args.get('date_from') and req.args.get('date_to'):
            date_range = get_date_filters(req.args)
            for doc in cursor.docs:
                # make the items display on the featured day,
                # it's used in ui instead of dates.start and dates.end
                doc.update({
                    '_display_from': date_range.get('gt'),
                    '_display_to': date_range.get('lt'),
                })
        return cursor

    def featured(self, req, lookup, featured):
        """Return featured items."""
        user = get_user()
        company = get_user_company(user)
        if is_events_only_access(user, company):
            abort(403)

        if not featured or not featured.get('items'):
            return ListCursor([])

        query = _agenda_query()
        get_resource_service('section_filters').apply_section_filter(query, self.section)
        planning_items_query = nested_query(
            'planning_items',
            {
                'bool': {'must': [{'terms': {'planning_items.guid': featured['items']}}]}
            },
            name='featured'
        )
        if req.args.get('q'):
            query['bool']['must'].append(query_string(req.args['q']))
            planning_items_query['nested']['query']['bool']['must'].append(planning_items_query_string(req.args['q']))

        query['bool']['must'].append(planning_items_query)

        source = {'query': query}
        set_post_filter(source, req)
        source['size'] = len(featured['items'])
        source['from'] = req.args.get('from', 0, type=int)
        if not source['from']:
            source['aggs'] = aggregations

        if company and not is_admin(user) and company.get('events_only', False):
            # no adhoc planning items and remove planning items and coverages fields
            query['bool']['must'].append({'exists': {'field': 'event'}})
            _remove_fields(source, PLANNING_ITEMS_FIELDS)

        internal_req = ParsedRequest()
        internal_req.args = {'source': json.dumps(source)}
        cursor = super().get(internal_req, lookup)

        docs_by_id = {}
        for doc in cursor.docs:
            for p in (doc.get('planning_items') or []):
                docs_by_id[p.get('guid')] = doc

            # make the items display on the featured day,
            # it's used in ui instead of dates.start and dates.end
            doc.update({
                '_display_from': featured['display_from'],
                '_display_to': featured['display_to'],
            })

        docs = []
        agenda_ids = set()
        for _id in featured['items']:
            if docs_by_id.get(_id) and docs_by_id.get(_id).get('_id') not in agenda_ids:
                docs.append(docs_by_id.get(_id))
                agenda_ids.add(docs_by_id.get(_id).get('_id'))

        cursor.docs = docs
        return cursor

    def get_items(self, item_ids):
        query = {
            'bool': {
                'must': [
                    {'terms': {'_id': item_ids}}
                ],
            }
        }
        get_resource_service('section_filters').apply_section_filter(query, self.section)
        return self.get_items_by_query(query, size=len(item_ids))

    def get_items_by_query(self, query, size=50):
        try:
            source = {'query': query}

            if size:
                source['size'] = size

            req = ParsedRequest()
            req.args = {'source': json.dumps(source)}

            return super().get(req, None)
        except Exception as exc:
            logger.error('Error in get_items for agenda query: {}'.format(json.dumps(source)),
                         exc, exc_info=True)

    def get_matching_bookmarks(self, item_ids, active_users, active_companies):
        """
        Returns a list of user ids bookmarked any of the given items
        :param item_ids: list of ids of items to be searched
        :param active_users: user_id, user dictionary
        :param active_companies: company_id, company dictionary
        :return:
        """
        bookmark_users = []

        search_results = self.get_items(item_ids)

        if not search_results:
            return bookmark_users

        for result in search_results.hits['hits']['hits']:
            bookmarks = result['_source'].get('watches', [])
            for bookmark in bookmarks:
                user = active_users.get(bookmark)
                if user and str(user.get('company', '')) in active_companies:
                    bookmark_users.append(bookmark)

        return bookmark_users

    def set_delivery(self, wire_item):
        if not wire_item.get('coverage_id'):
            return

        def is_delivery_validated(coverage, item):
            latest_delivery = get_latest_available_delivery(coverage)
            if not latest_delivery or not item.get('rewrite_sequence'):
                return True

            if (item.get('rewrite_sequence') or 0) >= latest_delivery.get('sequence_no', 0) or \
                    (item.get('publish_schedule') or item.get('firstpublished')) >= latest_delivery.get('publish_time'):
                return True

            return False

        query = {
            'bool': {
                'must': [
                    {'nested': {
                        'path': 'coverages',
                        'query': {
                            'bool': {
                                'must': [
                                    {'term': {'coverages.coverage_id': wire_item['coverage_id']}}
                                ]
                            }
                        },
                    }}
                ],
            }
        }

        agenda_items = self.get_items_by_query(query)
        for item in agenda_items:
            wire_item.setdefault('agenda_id', item['_id'])
            wire_item.setdefault('agenda_href', url_for('agenda.item', _id=item['_id']))
            coverages = item['coverages']
            for coverage in coverages:
                if coverage['coverage_id'] == wire_item['coverage_id'] and is_delivery_validated(coverage, item):
                    coverage['delivery_id'] = wire_item['guid']
                    coverage['delivery_href'] = url_for_wire(None, _external=False, section='wire.item',
                                                             _id=wire_item['guid'])
                    coverage['workflow_status'] = ASSIGNMENT_WORKFLOW_STATE.COMPLETED
                    self.system_update(item['_id'], {'coverages': coverages}, item)
                    updated_agenda = get_entity_or_404(item.get('_id'), 'agenda')

                    # Notify agenda to update itself with new details of coverage
                    self.enhance_coverage_with_wire_details(coverage, wire_item)
                    push_notification('new_item', _items=[item])

                    self.notify_agenda_update(updated_agenda, updated_agenda, None, True, None, coverage)
                    break
        return agenda_items

    def notify_new_coverage(self, agenda, wire_item):
        user_dict = get_user_dict()
        company_dict = get_company_dict()
        notify_user_ids = filter_active_users(agenda.get('watches', []), user_dict, company_dict, events_only=True)
        for user_id in notify_user_ids:
            user = user_dict[str(user_id)]
            send_coverage_notification_email(user, agenda, wire_item)

    def notify_agenda_update(self, update_agenda, original_agenda, item=None, events_only=False,
                             related_planning_removed=None, coverage_updated=None):
        agenda = deepcopy(update_agenda)
        if agenda and original_agenda.get('state') != WORKFLOW_STATE.KILLED:
            user_dict = get_user_dict()
            company_dict = get_company_dict()
            notify_user_ids = filter_active_users(original_agenda.get('watches', []),
                                                  user_dict,
                                                  company_dict,
                                                  events_only)
            users = [user_dict[str(user_id)] for user_id in notify_user_ids]
            # Only one push-notification
            push_notification('agenda_update',
                              item=agenda,
                              users=notify_user_ids)

            if len(notify_user_ids) == 0:
                return

            def get_detailed_coverage(cov):
                plan = next((p for p in (agenda.get('planning_items') or []) if p['guid'] == cov.get('planning_id')),
                            None)
                if plan and plan.get('state') != WORKFLOW_STATE.KILLED:
                    return next((c for c in (plan.get('coverages') or [])
                                 if c.get('coverage_id') == cov.get('coverage_id')), None)
                return cov

            def fill_all_coverages(skip_coverages=[], cancelled=False, use_original_agenda=False):
                fill_list = coverage_updates['unaltered_coverages'] if not cancelled else \
                        coverage_updates['cancelled_coverages']
                for coverage in (agenda if not use_original_agenda else original_agenda).get('coverages') or []:
                    if not next((s for s in skip_coverages if s.get('coverage_id') == coverage.get('coverage_id')),
                                None):
                        detailed_coverage = get_detailed_coverage(coverage)
                        if detailed_coverage:
                            fill_list.append(detailed_coverage)

            coverage_updates = {
                'modified_coverages': [],
                'cancelled_coverages': [],
                'unaltered_coverages': []
            }

            only_new_coverages = True
            time_updated = False
            state_changed = False
            coverage_modified = False

            # Send notification for only these state changes
            notify_states = [WORKFLOW_STATE.CANCELLED, WORKFLOW_STATE.RESCHEDULED, WORKFLOW_STATE.POSTPONED,
                             WORKFLOW_STATE.KILLED, WORKFLOW_STATE.SCHEDULED]

            if not related_planning_removed:
                # Send notification if time got updated
                if original_agenda.get('dates') and agenda.get('dates'):
                    time_updated = (original_agenda.get('dates') or {}).get('start').replace(tzinfo=None) != \
                                   (agenda.get('dates') or {}).get('start').replace(tzinfo=None) or \
                        (original_agenda.get('dates') or {}).get('end').replace(tzinfo=None) != \
                        (agenda.get('dates') or {}).get('end').replace(tzinfo=None)

                if agenda.get('state') and agenda.get('state') != original_agenda.get('state'):
                    state_changed = agenda.get('state') in notify_states

                if not state_changed:
                    if time_updated:
                        fill_all_coverages()
                    else:
                        for coverage in agenda.get('coverages') or []:
                            existing_coverage = next((c for c in original_agenda.get('coverages') or []
                                                      if c['coverage_id'] == coverage['coverage_id']), None)
                            detailed_coverage = get_detailed_coverage(coverage)
                            if detailed_coverage:
                                if not existing_coverage:
                                    if coverage['workflow_status'] != WORKFLOW_STATE.CANCELLED:
                                        coverage_updates['modified_coverages'].append(detailed_coverage)
                                elif coverage.get('workflow_status') == WORKFLOW_STATE.CANCELLED and \
                                        existing_coverage.get('workflow_status') != coverage.get('workflow_status'):
                                    coverage_updates['cancelled_coverages'].append(detailed_coverage)
                                elif (coverage.get('delivery_state') != existing_coverage.get('delivery_state') and
                                        coverage.get('delivery_state') == 'published') or \
                                    (coverage.get('workflow_status') != existing_coverage.get('workflow_status') and
                                        coverage.get('workflow_status') == 'completed') or \
                                        (existing_coverage.get('scheduled') != coverage.get('scheduled')):
                                    coverage_updates['modified_coverages'].append(detailed_coverage)
                                    only_new_coverages = False
                                elif detailed_coverage['coverage_id'] != (coverage_updated or {}).get('coverage_id'):
                                    coverage_updates['unaltered_coverages'].append(detailed_coverage)

                        # Check for removed coverages - show it as cancelled
                        if item and item.get('type') == 'planning':
                            for original_cov in original_agenda.get('coverages') or []:
                                updated_cov = next((c for c in (agenda.get('coverages') or [])
                                                    if c.get('coverage_id') == original_cov.get('coverage_id')), None)
                                if not updated_cov:
                                    coverage_updates['cancelled_coverages'].append(original_cov)
                else:
                    fill_all_coverages(cancelled=False if agenda.get('state') == WORKFLOW_STATE.SCHEDULED else True,
                                       use_original_agenda=True)
            else:
                fill_all_coverages(related_planning_removed.get('coverages') or [])
                # Add removed coverages:
                for coverage in related_planning_removed.get('coverages') or []:
                    detailed_coverage = get_detailed_coverage(coverage)
                    if detailed_coverage:
                        coverage_updates['cancelled_coverages'].append(detailed_coverage)

            if len(coverage_updates['modified_coverages']) > 0 or len(coverage_updates['cancelled_coverages']) > 0:
                coverage_modified = True

            if coverage_updated or related_planning_removed or time_updated or state_changed or coverage_modified:
                agenda['name'] = agenda.get('name', original_agenda.get('name'))
                agenda['definition_short'] = agenda.get('definition_short', original_agenda.get('definition_short'))
                agenda['ednote'] = agenda.get('ednote', original_agenda.get('ednote'))
                agenda['state_reason'] = agenda.get('state_reason', original_agenda.get('state_reason'))
                subject = '{} -{} updated'.format(agenda['name'] or agenda['definition_short'],
                                                  ' Coverage' if coverage_modified else '')
                action = 'been updated.'
                if state_changed:
                    action = 'been {}.'.format(agenda.get('state') if agenda.get('state') != WORKFLOW_STATE.KILLED else
                                               'removed from the Agenda calendar')

                if len(coverage_updates['modified_coverages']) > 0 and only_new_coverages and \
                        len(coverage_updates['cancelled_coverages']) == 0:
                    action = 'new coverage(s).'

                message = 'The {} you have been following has {}'.format(
                    'event' if agenda.get('event') else 'coverage plan', action
                )
                if agenda.get('state_reason'):
                    reason_prefix = agenda.get('state_reason').find(':')
                    if reason_prefix > 0:
                        message = '{}, {}'.format(
                                message, agenda['state_reason'][(reason_prefix+1):len(agenda['state_reason'])])

                # Send notifications to users
                for user in users:
                    app.data.insert('notifications', [{
                        'item': agenda.get('_id'),
                        'user': user['_id']
                    }])

                    send_agenda_notification_email(
                        user,
                        agenda,
                        message,
                        subject,
                        original_agenda,
                        coverage_updates,
                        related_planning_removed,
                        coverage_updated,
                    )

    def get_saved_items_count(self):
        query = _agenda_query()
        get_resource_service('section_filters').apply_section_filter(query, self.section)
        user = get_user()
        company = get_user_company(user)
        set_product_query(query, company, self.section)
        set_saved_items_query(query, str(user['_id']))
        cursor = self.get_items_by_query(query, size=0)
        return cursor.count()

    def get_featured_stories(self, req, lookup):
        for_date = datetime.strptime(req.args.get('date_from'), '%d/%m/%Y %H:%M')
        offset = int(req.args.get('timezone_offset', '0'))
        local_date = get_local_date(for_date.strftime('%Y-%m-%d'), datetime.strftime(for_date, '%H:%M:%S'), offset)
        featured_doc = get_resource_service('agenda_featured').find_one_for_date(local_date)
        return self.featured(req, lookup, featured_doc)
