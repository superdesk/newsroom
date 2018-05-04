import superdesk

from flask import Blueprint
from flask_babel import gettext
from newsroom.wire.search import WireSearchResource, WireSearchService
from . import utils
from superdesk.metadata.item import not_analyzed

blueprint = Blueprint('wire', __name__)

from . import views  # noqa


def init_app(app):
    app.config['DOMAIN']['items']['schema'].update({
        'word_count': {'type': 'integer'},
    })

    app.config['DOMAIN']['items']['schema'].update({
        'products': {
            'type': 'list',
            'mapping': {
                'type': 'object',
                'properties': {
                    'code': not_analyzed,
                    'name': not_analyzed
                }
            }
        }
    })

    superdesk.register_resource('wire_search', WireSearchResource, WireSearchService, _app=app)

    app.sidenav('Home', 'wire.index', 'home')
    app.sidenav('Wire', 'wire.wire', 'text')
    app.sidenav('Saved Items', 'wire.bookmarks', 'bookmark')

    from .formatters import TextFormatter, NITFFormatter, NewsMLG2Formatter
    app.add_download_formatter('text', TextFormatter(), gettext('Plain Text'))
    app.add_download_formatter('nitf', NITFFormatter(), 'NITF')
    app.add_download_formatter('newsmlg2', NewsMLG2Formatter(), 'NewsMLG2')

    app.add_template_global(utils.get_picture, 'get_picture')
    app.add_template_global(utils.get_caption, 'get_caption')
