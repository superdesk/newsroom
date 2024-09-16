import superdesk
import logging
from flask import request, make_response, jsonify
from eve.methods.get import get_internal
from .error_handlers import process_error_response
from .auth import authenticate
from .syndicate_handlers import FORMAT_HANDLERS, FEED_GENERATORS as FORMAT_HANDLERS_INIT
from .resource import NewsAPISyndicateResource
from .service import NewsAPISyndicateService
from werkzeug.routing import BaseConverter

syndicate_blueprint = superdesk.Blueprint('syndicate', __name__)

logger = logging.getLogger(__name__)


class RegExConverter(BaseConverter):
    def __init__(self, map, regex='[^/]+'):
        super().__init__(map)
        self.regex = regex


@syndicate_blueprint.route('/<regex("atom|rss|syndicate"):syndicate_type>', methods=['GET'])
@syndicate_blueprint.route('/<regex("atom|rss|syndicate"):syndicate_type>/<path:token>', methods=['GET'])
@authenticate
def get_syndicate_feed(syndicate_type, token=None):
    response = get_internal('news/syndicate')
    format_param = request.args.get('formatter')
    if format_param:
        format_param = format_param.upper().strip()
        try:
            return FORMAT_HANDLERS[format_param]['handler'](response[0], format_param)
        except ValueError as e:
            error_message = f"An error occurred in converting response to {format_param}: {e}"
            error_response = make_response(jsonify({'error': error_message}), 400)
            return process_error_response(error_response)

    return FORMAT_HANDLERS_INIT[syndicate_type.lower()](response[0])


def init_app(app):
    superdesk.register_resource('news/syndicate', NewsAPISyndicateResource, NewsAPISyndicateService, _app=app)
    app.url_map.converters['regex'] = RegExConverter
    superdesk.blueprint(syndicate_blueprint, app)
