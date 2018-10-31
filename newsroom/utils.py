from datetime import datetime
from uuid import uuid4

from bson import ObjectId
from flask import current_app as app, json, abort, request, g, url_for
from werkzeug.utils import secure_filename
from eve.utils import config, parse_request
from eve_elastic.elastic import parse_date

import superdesk
from newsroom.upload import ASSETS_RESOURCE


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
        'am_news': 'items'
    }
    return types[item_type]


def parse_dates(item):
    for field in ['firstcreated', 'versioncreated']:
        if item.get(field) and type(item[field]) == str:
            item[field] = parse_date(item[field])


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
