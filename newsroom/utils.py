import superdesk
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from uuid import uuid4
import pytz
import bleach

from superdesk.utc import utcnow
from superdesk.json_utils import try_cast
from bson import ObjectId
from eve.utils import config, parse_request
from eve_elastic.elastic import parse_date
from flask import current_app as app, json, abort, request, g, flash, session, url_for
from flask_babel import gettext
from newsroom.template_filters import time_short, parse_date as parse_short_date, format_datetime, is_admin
from newsroom.auth import get_user_id
from unicodedata import category
from html import unescape


DAY_IN_MINUTES = 24 * 60 - 1

# A whitelist of the characters allowed in the Telephone and mobile fields
PHONE_REGEX = r"^[0-9-+\s()#]+$"


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


def cast_item(o):
    if isinstance(o, (int, float, bool)):
        return o
    elif isinstance(o, str):
        return try_cast(o)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            o[i] = cast_item(v)
        return o
    elif isinstance(o, dict):
        for k, v in o.items():
            o[k] = cast_item(v)
        return o
    else:
        return o


def loads(s):
    o = json.loads(s)

    if isinstance(o, list):
        for i, v in enumerate(o):
            o[i] = cast_item(v)
        return o
    elif isinstance(o, dict):
        for k, v in o.items():
            o[k] = cast_item(v)
        return o
    else:
        return cast_item(o)


def get_entity_or_404(_id, resource):
    item = superdesk.get_resource_service(resource).find_one(req=None, _id=_id)
    if not item:
        abort(404)
    return item


def get_entities_elastic_or_mongo_or_404(_ids, resource):
    '''Finds item in elastic search as fist preference. If not configured, finds from mongo'''
    elastic = app.data._search_backend(resource)
    items = []
    if elastic:
        for id in _ids:
            item = elastic.find_one('items', req=None, _id=id)
            if not item:
                item = get_entity_or_404(id, resource)

            items.append(item)
    else:
        items = [get_entity_or_404(i, resource) for i in _ids]

    return items


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
        'media_releases': 'items',
        'monitoring': 'items',
        'factcheck': 'items',
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


def get_entity_dict(items, str_id=False):
    if (str_id):
        return {str(item['_id']): item for item in items}

    return {item['_id']: item for item in items}


def is_json_request(request):
    """Test if request is for json content."""
    return request.args.get('format') == 'json' or \
        request.accept_mimetypes.best_match(['application/json', 'text/html']) == 'application/json'


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


def get_agenda_dates(agenda, date_paranthesis=False):
    start = parse_date_str(agenda.get('dates', {}).get('start'))
    end = parse_date_str(agenda.get('dates', {}).get('end'))

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

    if date_paranthesis:
        return '{} - {} ({})'.format(time_short(start), time_short(end), date_short(start))

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

    return ', '.join([location_part for location_part in location_items if location_part])


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


def is_company_enabled(user, company=None):
    """
    Checks if the company of the user is enabled
    """
    if not user.get('company'):
        # there's no company assigned return true for admin user else false
        return True if is_admin(user) else False

    user_company = get_cached_resource_by_id('companies', user.get('company')) if not company else company
    if not user_company:
        return False

    return user_company.get('is_enabled', False)


def is_company_expired(company):
    expiry_date = company.get('expiry_date')
    if not expiry_date:
        return False
    return expiry_date.replace(tzinfo=None) <= datetime.utcnow().replace(tzinfo=None)


def is_account_enabled(user):
    """
    Checks if user account is active and approved
    """
    if not user.get('is_enabled'):
        flash(gettext('Account is disabled'), 'danger')
        return False

    if not user.get('is_approved'):
        account_created = user.get('_created')

        if account_created < utcnow() + timedelta(days=-app.config.get('NEW_ACCOUNT_ACTIVE_DAYS', 14)):
            flash(gettext('Account has not been approved'), 'danger')
            return False

    return True


def get_user_dict():
    """Get all active users indexed by _id."""
    if 'user_dict' not in g or app.testing:
        lookup = {'is_enabled': True}
        all_users = query_resource('users', lookup=lookup)
        companies = get_company_dict()
        user_dict = {str(user['_id']): user for user in all_users
                     if is_company_enabled(user, companies.get(user.get('company')))}
        g.user_dict = user_dict
    return g.user_dict


def get_company_dict():
    """Get all active companies indexed by _id.

    Must reload when testing because there it's using single context.
    """
    if 'company_dict' not in g or app.testing:
        lookup = {'is_enabled': True}
        all_companies = list(query_resource('companies', lookup=lookup))
        g.company_dict = {str(company['_id']): company for company in all_companies
                          if is_company_enabled({'company': company['_id']}, company)}
    return g.company_dict


def get_cached_resource_by_id(resource, _id, black_list_keys=None):
    """If the document exist in cache then return the document form cache
    else fetch the document from the database store in the cache and return the document.


    :param str resource: Name of the resource
    :param _id: id
    :param set black_list_keys: black list of keys to exclude from the document.
    """
    item = app.cache.get(str(_id))
    if item:
        return loads(item)

    # item is not stored in cache
    item = superdesk.get_resource_service(resource).find_one(req=None, _id=_id)
    if item:
        if not black_list_keys:
            black_list_keys = {'password', 'token', 'token_expiry'}
        item = {key: item[key] for key in item.keys() if key not in black_list_keys and not key.startswith('_')}
        app.cache.set(str(_id), json.dumps(item, default=json_serialize_datetime_objectId))
        return item
    return None


def is_valid_login(user_id):
    """Validates if the login for user.
    :param str user_id: id of the user
    """
    user = get_cached_resource_by_id('users', user_id)
    if not (is_account_enabled(user)):
        session.pop('_flashes', None)  # remove old messages and just show one message
        flash(gettext('Account is disabled'), 'danger')
        return False
    company = get_cached_resource_by_id('companies', user.get('company')) if user.get('company') else None
    if not is_company_enabled(user, company):
        session.pop('_flashes', None)  # remove old messages and just show one message
        flash(gettext('Company account has been disabled.'), 'danger')
        return False

    # Updated the active time for the user if required
    if not user.get('last_active') or user.get('last_active') < utcnow() + timedelta(minutes=-10):
        current_time = utcnow()
        # Set the cached version of the user
        user['last_active'] = current_time
        app.cache.set(str(user_id), json.dumps(user, default=json_serialize_datetime_objectId))
        # Set the db version of the user
        superdesk.get_resource_service('users').system_update(ObjectId(user_id), {'last_active': current_time}, user)

    return True


def get_items_by_id(ids, resource):
    return list(superdesk.get_resource_service(resource).find(where={'_id': {'$in': ids}}))


def get_vocabulary(id):
    vocabularies = app.data.pymongo('items').db.vocabularies
    if vocabularies and vocabularies.count_documents({}) > 0 and id:
        return vocabularies.find_one({'_id': id})

    return None


def url_for_agenda(item, _external=True):
    """Get url for agenda item."""
    return url_for('agenda.index', item=item['_id'], _external=_external)


def set_original_creator(doc):
    doc['original_creator'] = get_user_id()


def set_version_creator(doc):
    doc['version_creator'] = get_user_id()


def get_items_for_user_action(_ids, item_type):
    # Getting entities from elastic first so that we get all fields
    # even those which are not a part of ItemsResource(content_api) schema.
    items = get_entities_elastic_or_mongo_or_404(_ids, item_type)

    if not items or items[0].get('type') != 'text':
        return items

    for item in items:
        if item.get('slugline') and item.get('anpa_take_key'):
            item['slugline'] = '{0} | {1}'.format(item['slugline'], item['anpa_take_key'])

    return items


def get_utcnow():
    """ added for unit tests """
    return datetime.utcnow()


def today(time, offset):
    user_local_date = get_utcnow() - timedelta(minutes=offset)
    local_start_date = datetime.strptime('%sT%s' % (user_local_date.strftime('%Y-%m-%d'), time),
                                         '%Y-%m-%dT%H:%M:%S')
    return local_start_date


def format_date(date, time, offset):
    if date == 'now/d':
        return today(time, offset)
    if date == 'now/w':
        _today = today(time, offset)
        monday = _today - timedelta(days=_today.weekday())
        return monday
    if date == 'now/M':
        month = today(time, offset).replace(day=1)
        return month
    return datetime.strptime('%sT%s' % (date, time), '%Y-%m-%dT%H:%M:%S')


def get_local_date(date, time, offset):
    local_dt = format_date(date, time, offset)
    return pytz.utc.normalize(local_dt.replace(tzinfo=pytz.utc) + timedelta(minutes=offset))


def get_end_date(date_range, start_date):
    if date_range == 'now/d':
        return start_date
    if date_range == 'now/w':
        return start_date + timedelta(days=6)
    if date_range == 'now/M':
        return start_date + relativedelta(months=+1) - timedelta(days=1)
    return start_date


def is_safe_string(field, allowed_punctuation=("'")):
    """

    You can find a full list of categories here:
    http://www.fileformat.info/info/unicode/category/index.htm
    :rtype: Boolean
    """
    if field is None:
        return True

    letters = ('LC', 'Ll', 'Lm', 'Lo', 'Lt', 'Lu')
    numbers = ('Nd', 'Nl', 'No')
    marks = ('Mc', 'Me', 'Mn')
    punctuation = ('Pc', 'Pd', 'Pe', 'Ps', 'Po')
    symbol = ('Sc', 'Sk', 'So')
    space = ('Zs',)

    allowed_categories = letters + numbers + marks + punctuation + symbol + space
    clean = u''.join([c for c in field if
                      (category(c) in allowed_categories or (c in allowed_punctuation))])
    return clean == field


def clean_item(item, fields):
    for entry in fields:
        if item.get(entry):
            item[entry] = unescape(bleach.clean(item.get(entry), strip=True))
    return item


def clean_company(company):
    return clean_item(company, ("contact_name", "country", "name", "account_manager", "company_type"))


def clean_user(user):
    return clean_item(user, ('first_name', 'last_name', 'email', 'role', 'phone', 'mobile', 'locale', 'country'))


def clean_navigation(navigation):
    return clean_item(navigation, ("name", "description", "product_type"))


def clean_product(product):
    return clean_item(product, ("name", "description", "product_type", "sd_product_id", "query"))


def clean_section_filter(filter):
    return clean_item(filter, ('name', 'description', 'sd_product_id', 'query', 'filter_type', 'search_type'))


def clean_card(card):
    return clean_item(card, ('label', 'dashboard', 'type'))
