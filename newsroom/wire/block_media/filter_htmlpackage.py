from functools import wraps
import flask
from newsroom.auth import get_user
from newsroom.wire.block_media.company_factory import CompanyFactory


def filter_embedded_data(func):
    @wraps(func)
    def wrapper(self, item, item_type='items'):
        embedded_data = CompanyFactory.get_embedded_data(get_user(required=True))
        if any(embedded_data):
            return str.encode(flask.render_template('download_embed.html', item=item), 'utf-8')
        return func(self, item, item_type)
    return wrapper
