
from flask import current_app as app
from eve.utils import parse_request
from uuid import uuid4


def query_resource(resource, lookup=None, max_results=0):
    req = parse_request(resource)
    req.max_results = max_results
    return app.data.find(resource, req, lookup)


def find_one(resource, **lookup):
    req = parse_request(resource)
    return app.data.find_one(resource, req, **lookup)


def get_random_string():
    return str(uuid4())
