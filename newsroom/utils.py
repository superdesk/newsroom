
from flask import current_app as app
from eve.utils import parse_request
from uuid import uuid4
from datetime import datetime
from bson import ObjectId
from eve.utils import config


def query_resource(resource, lookup=None, max_results=0):
    req = parse_request(resource)
    req.max_results = max_results
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
