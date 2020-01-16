import superdesk
from content_api.api_audit import ApiAuditService, ApiAuditResource
from copy import deepcopy


class NewsApiAuditService(ApiAuditService):
    pass


class NewsApiAuditResource(ApiAuditResource):
    schema = deepcopy(ApiAuditResource.schema)
    schema.update({'items_id': {
        'type': 'list',
        'mapping': {'type': 'string'}
    }})


def init_app(app):
    if app.config.get('NEWS_API_ENABLED'):
        superdesk.register_resource('api_audit', NewsApiAuditResource, NewsApiAuditService, _app=app)
