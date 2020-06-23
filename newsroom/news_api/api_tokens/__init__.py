import superdesk
from flask import Blueprint
from flask_babel import gettext
from .resource import NewsApiTokensResource
from .service import NewsApiTokensService
from eve.auth import TokenAuth
import ipaddress
from flask import g, current_app as app, abort, request
from superdesk.utc import utcnow
from superdesk import get_resource_service
from datetime import timedelta

API_TOKENS = 'news_api_tokens'

blueprint = Blueprint('news_api_tokens', __name__)

from . import views  # noqa


class CompanyTokenAuth(TokenAuth):
    def check_auth(self, token_id, allowed_roles, resource, method):
        """Try to find auth token and if valid put subscriber id into ``g.user``."""
        token = app.data.mongo.find_one(API_TOKENS, req=None, _id=token_id)
        if not token:
            return False
        # Check if the token has expired
        now = utcnow()
        if token.get('expiry') and token.get('expiry') < now:
            return False
        # Make sure the API is enabled
        if not token.get('enabled', False):
            return False

        # Make sure that the company is enabled
        company = app.data.mongo.find_one('companies', req=None, _id=token.get('company'))
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

        # Check rate_limit
        updates = {}
        new_period = False
        if app.config.get('RATE_LIMIT_REQUESTS'):
            new_period = (not token.get('rate_limit_expiry') or token['rate_limit_expiry'] <= now)
            if new_period:
                updates['rate_limit_requests'] = 1
            elif token.get('rate_limit_expiry'):
                if token.get('rate_limit_requests', 0) >= app.config.get('RATE_LIMIT_REQUESTS'):
                    abort(429, gettext('Rate limit exceeded'))
                else:
                    updates['rate_limit_requests'] = token.get('rate_limit_requests', 0) + 1

        if app.config.get('RATE_LIMIT_PERIOD') and new_period:
            updates['rate_limit_expiry'] = now + timedelta(seconds=app.config.get('RATE_LIMIT_PERIOD'))

        if updates:
            get_resource_service(API_TOKENS).patch(token_id, updates)

            # Set Flask global variables
            g.rate_limit_requests = updates['rate_limit_requests']
            if (updates.get('rate_limit_expiry')):
                g.rate_limit_expiry = updates['rate_limit_expiry']

        g.user = str(token.get('company'))
        return g.user


def init_app(app):
    if app.config.get('NEWS_API_ENABLED'):
        superdesk.register_resource(API_TOKENS, NewsApiTokensResource, NewsApiTokensService, _app=app)
