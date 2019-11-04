import os
import flask
import logging
from eve import Eve
from eve.io.mongo.mongo import MongoJSONEncoder
from newsroom.news_api.api_tokens import CompanyTokenAuth
from superdesk.datalayer import SuperdeskDataLayer
from newsroom.news_api.news.item.item import bp
import importlib


logger = logging.getLogger(__name__)


def get_app(config=None):
    app_config = flask.Config('.')

    # set some required fields
    app_config.update({'DOMAIN': {'upload': {}}, 'SOURCES': {}})

    # pickup the default newsroom settings
    app_config.from_object('newsroom.default_settings')

    try:
        # override from settings module, but only things defined in default config
        import newsroom.news_api.settings as server_settings
        for key in dir(server_settings):
            if key.isupper() and key in app_config:
                app_config[key] = getattr(server_settings, key)
    except ImportError:
        pass  # if exists

    if config:
        app_config.update(config)

    # check that the API is enabled to run
    if not app_config.get('NEWS_API_ENABLED', False):
        logger.error('News API is not enabled')
        return None

    app = Eve(auth=CompanyTokenAuth,
              json_encoder=MongoJSONEncoder,
              data=SuperdeskDataLayer,
              settings=app_config)

    app._general_settings = {'news_api_time_limit_days': {'type': 'number',
                                                          'default': app.config.get('NEWS_API_TIME_LIMIT_DAYS', 0)}}

    app.register_blueprint(bp)

    for module_name in app_config.get('CORE_APPS', []):
        app_module = importlib.import_module(module_name)
        try:
            app_module.init_app(app)
        except AttributeError:
            pass

    return app


app = get_app()

if __name__ == '__main__':
    host = '0.0.0.0'
    port = int(os.environ.get('APIPORT', '5400'))
    app = get_app()
    if app.config.get('NEWS_API_ENABLED', False):
        app.run(host=host, port=port, debug=True, use_reloader=True)
    else:
        logger.error('News API is not enabled')
