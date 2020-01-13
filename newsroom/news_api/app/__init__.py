import os
import logging
import flask

from werkzeug.exceptions import HTTPException
from superdesk.errors import SuperdeskApiError

from newsroom.factory import NewsroomApp
from newsroom.news_api.api_tokens import CompanyTokenAuth


logger = logging.getLogger(__name__)


class NewsroomNewsAPI(NewsroomApp):
    AUTH_SERVICE = CompanyTokenAuth

    def __init__(self, import_name=__package__, config=None, **kwargs):
        if not getattr(self, 'settings'):
            self.settings = flask.Config('.')

        super(NewsroomNewsAPI, self).__init__(import_name=import_name, config=config, **kwargs)

        if not self.config.get('NEWS_API_ENABLED', False):
            raise RuntimeError('News API is not enabled')

    def load_app_config(self):
        super(NewsroomNewsAPI, self).load_app_config()
        self.config.from_object('newsroom.news_api.settings')
        self.config.from_envvar('NEWS_API_SETTINGS', silent=True)

    def setup_error_handlers(self):
        def json_error(err):
            return flask.jsonify(err), err['code']

        def handle_werkzeug_errors(err):
            return json_error({
                'error': str(err),
                'message': getattr(err, 'description') or None,
                'code': getattr(err, 'code') or 500
            })

        def superdesk_api_error(err):
            return json_error({
                'error': err.message or '',
                'message': err.payload,
                'code': err.status_code or 500,
            })

        def assertion_error(err):
            return json_error({
                'error': err.args[0] if err.args else 1,
                'message': str(err),
                'code': 400
            })

        def base_exception_error(err):
            return json_error({
                'error': err.args[0] if err.args else 1,
                'message': str(err),
                'code': 500
            })

        for cls in HTTPException.__subclasses__():
            self.register_error_handler(cls, handle_werkzeug_errors)

        self.register_error_handler(SuperdeskApiError, superdesk_api_error)
        self.register_error_handler(AssertionError, assertion_error)
        self.register_error_handler(Exception, base_exception_error)


def get_app(config=None):
    return NewsroomNewsAPI(__name__, config=config)


app = get_app()

if __name__ == '__main__':
    host = '0.0.0.0'
    port = int(os.environ.get('APIPORT', '5400'))
    app.run(host=host, port=port, debug=True, use_reloader=True)
