from datetime import datetime
from uuid import uuid4

import superdesk
from bson import ObjectId
from eve.utils import config, parse_request
from eve_elastic.elastic import parse_date
from flask import current_app as app, json, abort, request
from flask import url_for
from werkzeug.utils import secure_filename

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


def parse_dates(item):
    for field in ['firstcreated', 'versioncreated']:
        if item.get(field) and type(item[field]) == str:
            item[field] = parse_date(item[field])


def get_entity_dict(items):
    return {item['_id']: item for item in items}
