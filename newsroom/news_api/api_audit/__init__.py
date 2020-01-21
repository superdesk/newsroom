from superdesk import register_resource
import newsroom
from superdesk.resource import not_analyzed


class NewsApiAuditService(newsroom.Service):
    pass


class NewsApiAuditResource(newsroom.Resource):
    schema = {
        'type': not_analyzed,
        'subscriber': not_analyzed,
        'uri': not_analyzed,
        'items_id': not_analyzed,
        'version': not_analyzed,
        'remote_addr': not_analyzed,
        'endpoint': {
            'type': 'string',
            'mapping': not_analyzed
        },
    }
    schema.update({'items_id': {
            'type': 'list',
            'mapping': not_analyzed
        }, 'created': {'type': 'datetime'}})

    datasource = {
        'source': 'api_audit',
        'search_backend': 'elastic'
    }


def init_app(app):
    if app.config.get('NEWS_API_ENABLED'):
        register_resource('api_audit', NewsApiAuditResource, NewsApiAuditService, _app=app)
