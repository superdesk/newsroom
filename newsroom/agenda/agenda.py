
import logging
from datetime import timedelta

from content_api.items.resource import code_mapping
from dateutil.relativedelta import relativedelta
from eve.utils import ParsedRequest
from flask import json, abort, url_for, current_app as app
from flask_babel import gettext
from planning.common import WORKFLOW_STATE_SCHEMA
from planning.events.events_schema import events_schema
from planning.planning.planning import planning_schema
from superdesk import get_resource_service
from superdesk.metadata.item import not_analyzed
from superdesk.resource import Resource, not_enabled
from superdesk.utils import ListCursor

import newsroom
from newsroom.agenda.email import send_coverage_notification_email, send_agenda_notification_email
from newsroom.auth import get_user
from newsroom.companies import get_user_company
from newsroom.notifications import push_notification
from newsroom.utils import get_user_dict, get_company_dict, filter_active_users
from newsroom.wire.search import get_local_date
from newsroom.wire.search import query_string, set_product_query, FeaturedQuery
from newsroom.template_filters import is_admin_or_internal

logger = logging.getLogger(__name__)


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
    schema['abstract'] = planning_schema['abstract']
    schema['headline'] = planning_schema['headline']
    schema['firstcreated'] = events_schema['firstcreated']
    schema['version'] = events_schema['version']
    schema['versioncreated'] = events_schema['versioncreated']
    schema['ednote'] = events_schema['ednote']

    # aggregated fields
    schema['genre'] = planning_schema['genre']
    schema['subject'] = planning_schema['subject']
    schema['priority'] = planning_schema['priority']
    schema['urgency'] = planning_schema['urgency']
    schema['place'] = planning_schema['place']
    schema['service'] = code_mapping

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
        'mappping': {
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
                'delivery_id': not_analyzed,
                'delivery_href': not_analyzed,
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
        'mapping': not_enabled,
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


def get_end_date(date_range, start_date):
    if date_range == 'now/d':
        return start_date
    if date_range == 'now/w':
        return start_date + timedelta(days=6)
    if date_range == 'now/M':
        return start_date + relativedelta(months=+1) - timedelta(days=1)
    return start_date


def _get_date_filters(args):
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
    return {'range': {'dates.end': _get_date_filters(args)}}


def _display_date_range(args):
    """Get events for extra dates for coverages and planning.
    """
    return {'range': {'display_dates.date': _get_date_filters(args)}}


aggregations = {
    'calendar': {'terms': {'field': 'calendars.name', 'size': 20}},
    'location': {'terms': {'field': 'location.name', 'size': 20}},
    'genre': {'terms': {'field': 'genre.name', 'size': 50}},
    'service': {'terms': {'field': 'service.name', 'size': 50}},
    'subject': {'terms': {'field': 'subject.name', 'size': 20}},
    'urgency': {'terms': {'field': 'urgency'}},
    'place': {'terms': {'field': 'place.name', 'size': 50}},
    'coverage': {
        'nested': {'path': 'coverages'},
        'aggs': {'coverage_type': {'terms': {'field': 'coverages.coverage_type', 'size': 10}}}},
}


def get_aggregation_field(key):
    if key == 'coverage':
        return aggregations[key]['aggs']['coverage_type']['terms']['field']
    return aggregations[key]['terms']['field']


def _filter_terms(filters):
    term_filters = []
    for key, val in filters.items():
        if val and key != 'coverage':
            term_filters.append({'terms': {get_aggregation_field(key): val}})
        if val and key == 'coverage':
            term_filters.append(
                {"nested": {
                    "path": "coverages",
                    "query": {"bool": {"must": [{'terms': {get_aggregation_field(key): val}}]}}
                }})

    return term_filters


def _remove_attachments(source):
    source['_source'] = {
        'exclude': ['event.files']
    }


def set_post_filter(source, req):
    filters = None
    if req.args.get('filter'):
        filters = json.loads(req.args['filter'])
    if filters:
        source['post_filter'] = {'bool': {'must': [_filter_terms(filters)]}}


class AgendaService(newsroom.Service):
    def get(self, req, lookup):
        query = _agenda_query()
        user = get_user()
        company = get_user_company(user)
        try:
            set_product_query(query, company, navigation_id=req.args.get('navigation'))
        except FeaturedQuery:
            return self.featured(req, lookup)

        if req.args.get('q'):
            query['bool']['must'].append(query_string(req.args['q']))

        if req.args.get('id'):
            query['bool']['must'].append({'term': {'_id': req.args['id']}})

        if req.args.get('bookmarks'):
            set_saved_items_query(query, req.args['bookmarks'])

        if req.args.get('date_from') or req.args.get('date_to'):
            query['bool']['should'].append(_event_date_range(req.args))
            query['bool']['should'].append(_display_date_range(req.args))

        source = {'query': query}
        source['sort'] = [{'dates.start': 'asc'}]
        source['size'] = 100  # we should fetch all items for given date
        source['from'] = req.args.get('from', 0, type=int)

        set_post_filter(source, req)

        if source['from'] >= 1000:
            # https://www.elastic.co/guide/en/elasticsearch/guide/current/pagination.html#pagination
            return abort(400)

        if not source['from'] and not req.args.get('bookmarks'):  # avoid aggregations when handling pagination
            source['aggs'] = aggregations

        if not is_admin_or_internal(user):
            _remove_attachments(source)

        internal_req = ParsedRequest()
        internal_req.args = {'source': json.dumps(source)}
        return super().get(internal_req, lookup)

    def featured(self, req, lookup):
        """Return featured items."""
        featured = get_resource_service('agenda_featured').find_one_today()
        if not featured or not featured.get('items'):
            return ListCursor([])

        query = _agenda_query()
        query['bool']['must'].append({'terms': {'_id': featured['items']}})

        if req.args.get('q'):
            query['bool']['must'].append(query_string(req.args['q']))

        source = {'query': query}
        set_post_filter(source, req)
        source['size'] = len(featured['items'])
        source['from'] = req.args.get('from', 0, type=int)
        if not source['from']:
            source['aggs'] = aggregations

        internal_req = ParsedRequest()
        internal_req.args = {'source': json.dumps(source)}
        cursor = super().get(internal_req, lookup)

        docs_by_id = {}
        for doc in cursor.docs:
            docs_by_id[doc['_id']] = doc
            # make the items display on the featured day,
            # it's used in ui instead of dates.start and dates.end
            doc.update({
                '_display_from': featured['display_from'],
                '_display_to': featured['display_to'],
            })
        cursor.docs = [docs_by_id[_id] for _id in featured['items'] if docs_by_id.get(_id)]
        return cursor

    def get_items(self, item_ids):
        query = {
            'bool': {
                'must': [
                    {'terms': {'_id': item_ids}}
                ],
            }
        }

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
                if coverage['coverage_id'] == wire_item['coverage_id'] and not coverage.get('delivery'):
                    coverage['delivery_id'] = wire_item['guid']
                    coverage['delivery_href'] = url_for('wire.item', _id=wire_item['guid'])
                    self.system_update(item['_id'], {'coverages': coverages}, item)
                    self.notify_new_coverage(item, wire_item)
                    break

    def notify_new_coverage(self, agenda, wire_item):
        user_dict = get_user_dict()
        company_dict = get_company_dict()
        notify_user_ids = filter_active_users(agenda.get('watches', []), user_dict, company_dict)
        for user_id in notify_user_ids:
            user = user_dict[str(user_id)]
            send_coverage_notification_email(user, agenda, wire_item)

    def notify_agenda_update(self, update, agenda):
        if agenda:
            user_dict = get_user_dict()
            company_dict = get_company_dict()
            notify_user_ids = filter_active_users(agenda.get('watches', []), user_dict, company_dict)
            users = [user_dict[str(user_id)] for user_id in notify_user_ids]
            for user in users:
                app.data.insert('notifications', [{
                    'item': agenda['_id'],
                    'user': user['_id']
                }])
                send_agenda_notification_email(
                    user,
                    agenda,
                    agenda_notifications[update]['message'],
                    agenda_notifications[update]['subject'],
                )
            push_notification('agenda_update',
                              item=agenda,
                              users=notify_user_ids)

    def get_saved_items_count(self):
        query = _agenda_query()
        user = get_user()
        company = get_user_company(user)
        set_product_query(query, company)
        set_saved_items_query(query, str(user['_id']))
        cursor = self.get_items_by_query(query, size=0)
        return cursor.count()
