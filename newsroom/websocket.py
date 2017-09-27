
import os
from .flaskapp import Newsroom
from superdesk.ws import create_server

if __name__ == '__main__':
    app = Newsroom('newsroom')
    create_server(dict(
        WS_HOST='0.0.0.0',
        WS_PORT=int(os.environ.get('PORT', '5090')),
        BROKER_URL=app.config['CELERY_BROKER_URL'],
        WEBSOCKET_EXCHANGE=app.config['WEBSOCKET_EXCHANGE'],
    ))
