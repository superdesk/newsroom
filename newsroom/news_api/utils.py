from superdesk import get_resource_service
from superdesk.utc import utcnow
from flask import request, g


def post_api_audit(doc):
    audit_doc = {
        'created': utcnow(),
        'items_id': [doc.get('_id')] if doc.get('_id') else [i.get('_id') for i in doc.get('_items', [])],
        'remote_addr': request.access_route[0] if request.access_route else request.remote_addr,
        'uri': request.url,
        'endpoint': request.endpoint.replace('|resource', '').replace('news/', '')
    }

    # g.user contains comapny._id from CompanyTokenAuth.check_auth]
    if 'user' in g:
        audit_doc['subscriber'] = g.user

    get_resource_service('api_audit').post([audit_doc])


def format_report_results(search_result):
    results = {}
    for b in search_result.hits['aggregations']['endpoints']['buckets']:
        if b['doc_count']:
            results[b['key']] = b['doc_count']

    return results
