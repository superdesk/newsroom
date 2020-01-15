import superdesk
from flask import Blueprint
from .resource import NewsApiTokensResource
from .service import NewsApiTokensService
from eve.auth import TokenAuth
from flask import g, current_app as app, request
from superdesk.utc import utcnow
import ipaddress

API_TOKENS = 'news_api_tokens'

blueprint = Blueprint('news_api_tokens', __name__)

from . import views  # noqa


class CompanyTokenAuth(TokenAuth):
    def check_auth(self, token, allowed_roles, resource, method):
        """Try to find auth token and if valid put subscriber id into ``g.user``."""
        data = app.data.mongo.find_one(API_TOKENS, req=None, _id=token)
        if not data:
            return False
        # Check if the token has expired
        now = utcnow()
        if data.get('expiry') and data.get('expiry') < now:
            return False
        # Make sure the API is enabled
        if not data.get('enabled', False):
            return False

        # Make sure that the company is enabled
        company = app.data.mongo.find_one('companies', req=None, _id=data.get('company'))
        if not company:
            return False
        if not company.get('is_enabled', False):
            return False

        valid_network = False
        if company.get('allowed_ip_list'):
            # Request.access_route: If a forwarded header exists this is a
            # list of all ip addresses from the client ip to the last proxy server.
            # Ref. https://tedboy.github.io/flask/generated/generated/werkzeug.Request.access_route.html
            request_ip_address = ipaddress.ip_address(request.access_route[0])
            for i in company['allowed_ip_list']:
                if request_ip_address in ipaddress.ip_network(i, strict=False):
                    valid_network = True

            if not valid_network:
                return False

        g.user = str(data.get('company'))
        return g.user


def init_app(app):
    if app.config.get('NEWS_API_ENABLED'):
        superdesk.register_resource(API_TOKENS, NewsApiTokensResource, NewsApiTokensService, _app=app)
