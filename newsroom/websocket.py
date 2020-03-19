
import os
import logging

from superdesk.ws import create_server
from newsroom.web import NewsroomWebApp


if __name__ == '__main__':
    app = NewsroomWebApp('newsroom')
    host = '0.0.0.0'
    port = int(os.environ.get('PORT', '5100'))
    logging.info('listening on %s:%d', host, port)
    create_server(dict(
        WS_HOST=host,
        WS_PORT=port,
        BROKER_URL=app.config['CELERY_BROKER_URL'],
        WEBSOCKET_EXCHANGE=app.config['WEBSOCKET_EXCHANGE'],
    ))
