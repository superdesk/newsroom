import os
import logging
import flask
import jinja2

from werkzeug.exceptions import HTTPException
from superdesk.errors import SuperdeskApiError

from newsroom.factory import NewsroomApp
from newsroom.news_api.api_tokens import CompanyTokenAuth
from superdesk.utc import utcnow
from newsroom.template_filters import (
    datetime_short, datetime_long, time_short, date_short,
    plain_text, word_count, char_count, date_header
)

logger = logging.getLogger(__name__)

API_DIR = os.path.abspath(os.path.dirname(__file__))


class NewsroomNewsAPI(NewsroomApp):
    AUTH_SERVICE = CompanyTokenAuth

    def __init__(self, import_name=__package__, config=None, **kwargs):
        if not getattr(self, 'settings'):
            self.settings = flask.Config('.')

        super(NewsroomNewsAPI, self).__init__(import_name=import_name, config=config, **kwargs)

        template_folder = os.path.abspath(os.path.join(API_DIR, '../../templates'))

        self.add_template_filter(datetime_short)
        self.add_template_filter(datetime_long)
        self.add_template_filter(date_header)
        self.add_template_filter(plain_text)
        self.add_template_filter(time_short)
        self.add_template_filter(date_short)
        self.add_template_filter(word_count)
        self.add_template_filter(char_count)
        self.jinja_loader = jinja2.ChoiceLoader([
            jinja2.FileSystemLoader(template_folder),
        ])

    def load_app_config(self):
        super(NewsroomNewsAPI, self).load_app_config()
        self.config.from_object('newsroom.news_api.settings')
        self.config.from_envvar('NEWS_API_SETTINGS', silent=True)

    def run(self, host=None, port=None, debug=None, **options):
        if not self.config.get('NEWS_API_ENABLED', False):
            raise RuntimeError('News API is not enabled')

        super(NewsroomNewsAPI, self).run(host, port, debug, **options)

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
            if err.error == 'search_phase_execution_exception':
                return json_error({
                    'error': 1,
                    'message': 'Invalid search query',
                    'code': 400
                })

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
    app = NewsroomNewsAPI(__name__, config=config)

    @app.after_request
    def after_request(response):
        if flask.g.get('rate_limit_requests'):
            response.headers.add('X-RateLimit-Remaining',
                                 app.config.get('RATE_LIMIT_REQUESTS') - flask.g.get('rate_limit_requests'))
            response.headers.add('X-RateLimit-Limit', app.config.get('RATE_LIMIT_REQUESTS'))

            if flask.g.get('rate_limit_expiry'):
                response.headers.add('X-RateLimit-Reset', (flask.g.get('rate_limit_expiry') - utcnow()).seconds)
        return response

    return app


app = get_app()

if __name__ == '__main__':
    host = '0.0.0.0'
    port = int(os.environ.get('APIPORT', '5400'))
    app.run(host=host, port=port, debug=True, use_reloader=True)
