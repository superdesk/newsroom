import superdesk
from datetime import datetime, timedelta
from uuid import uuid4

from bson import ObjectId
from eve.utils import config, parse_request
from eve_elastic.elastic import parse_date
from flask import current_app as app, json, abort, request, g, url_for
from flask_babel import gettext
from werkzeug.utils import secure_filename
from newsroom.upload import ASSETS_RESOURCE
from newsroom.template_filters import time_short, parse_date as parse_short_date, format_datetime

DAY_IN_MINUTES = 24 * 60 - 1


def query_resource(resource, lookup=None, max_results=0, projection=None):
    req = parse_request(resource)
    req.max_results = max_results
    req.projection = json.dumps(projection) if projection else None
    return app.data.find(resource, req, lookup)


def find_one(resource, **lookup):
    req = parse_request(resource)
    return app.data.find_one(resource, req, **lookup)


def get_random_string():
    return str(uuid4())


def json_serialize_datetime_objectId(obj):
    """
    Serialize so that objectid and date are converted to appropriate format.
    """
    if isinstance(obj, datetime):
        return str(datetime.strftime(obj, config.DATE_FORMAT))

    if isinstance(obj, ObjectId):
        return str(obj)


def get_entity_or_404(_id, resource):
    item = superdesk.get_resource_service(resource).find_one(req=None, _id=_id)
    if not item:
        abort(404)
    return item


def get_file(key):
    file = request.files.get(key)
    if file:
        filename = secure_filename(file.filename)
        app.media.put(file, resource=ASSETS_RESOURCE, _id=filename, content_type=file.content_type)
        return url_for('upload.get_upload', media_id=filename)


def get_json_or_400():
    data = request.get_json()
    if not isinstance(data, dict):
        abort(400)
    return data


def get_type():
    item_type = request.args.get('type', 'wire')
    types = {
        'wire': 'items',
        'agenda': 'agenda',
        'am_news': 'items',
        'aapX': 'items',
    }
    return types[item_type]


def parse_date_str(date):
    if date and isinstance(date, str):
        return parse_date(date)
    return date


def parse_dates(item):
    for field in ['firstcreated', 'versioncreated', 'embargoed']:
        if parse_date_str(item.get(field)):
            item[field] = parse_date_str(item[field])


def get_entity_dict(items):
    return {item['_id']: item for item in items}


def is_json_request(request):
    """Test if request is for json content."""
    return request.args.get('format') == 'json' or \
        request.accept_mimetypes.best_match(['application/json', 'text/html']) == 'application/json'


def get_user_dict():
    """Get all active users indexed by _id."""
    if 'user_dict' not in g or app.testing:
        lookup = {'is_enabled': True}
        all_users = list(query_resource('users', lookup=lookup))
        g.user_dict = {str(user['_id']): user for user in all_users}
    return g.user_dict


def get_company_dict():
    """Get all active companies indexed by _id.

    Must reload when testing because there it's using single context.
    """
    if 'company_dict' not in g or app.testing:
        lookup = {'is_enabled': True}
        all_companies = list(query_resource('companies', lookup=lookup))
        g.company_dict = {str(company['_id']): company for company in all_companies}
    return g.company_dict


def filter_active_users(user_ids, user_dict, company_dict):
    active = []
    for _id in user_ids:
        user = user_dict.get(str(_id))
        if user and (not user.get('company') or str(user.get('company', '')) in company_dict):
            active.append(_id)
    return active


def unique_codes(key, *groups):
    """Get unique items from all lists using code."""
    codes = set()
    items = []
    for group in groups:
        for item in group:
            if item.get(key) and item[key] not in codes:
                codes.add(item[key])
                items.append(item)
    return items


def date_short(datetime):
    if datetime:
        return format_datetime(parse_short_date(datetime), "dd/MM/yyyy")


def get_agenda_dates(agenda):
    start = agenda.get('dates', {}).get('start')
    end = agenda.get('dates', {}).get('end')

    if start + timedelta(minutes=DAY_IN_MINUTES) < end:
        # Multi day event
        return '{} {} - {} {}'.format(
            time_short(start),
            date_short(start),
            time_short(end),
            date_short(end)
        )

    if start + timedelta(minutes=DAY_IN_MINUTES) == end:
        # All day event
        return '{} {}'.format(gettext('ALL DAY'), date_short(start))

    if start == end:
        # start and end dates are the same
        return '{} {}'.format(time_short(start), date_short(start))

    return '{} - {}, {}'.format(time_short(start), time_short(end), date_short(start))


def get_location_string(agenda):
    location = agenda.get('location', [])

    if not location:
        return ''

    location_items = [
        location[0].get('name'),
        location[0].get('address', {}).get('line', [''])[0],
        location[0].get('address', {}).get('area'),
        location[0].get('address', {}).get('locality'),
        location[0].get('address', {}).get('postal_code'),
        location[0].get('address', {}).get('country'),
    ]

    return ', '.join([l for l in location_items if l])


def get_public_contacts(agenda):
    contacts = agenda.get('event', {}).get('event_contact_info', [])
    public_contacts = []
    for contact in contacts:
        if contact.get('public', False):
            public_contacts.append({
                'name': ' '.join([c for c in [contact.get('first_name'), contact.get('last_name')] if c]),
                'organisation': contact.get('organisation', ''),
                'email': ', '.join(contact.get('contact_email', [])),
                'phone': ', '.join([c.get('number') for c in contact.get('contact_phone', []) if c.get('public')]),
                'mobile': ', '.join([c.get('number') for c in contact.get('mobile', []) if c.get('public')])
            })
    return public_contacts


def get_links(agenda):
    return agenda.get('event', {}).get('links', [])
