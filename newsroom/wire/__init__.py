import superdesk

from flask import Blueprint, url_for
from flask_babel import gettext
from newsroom.wire.search import WireSearchResource, WireSearchService
from . import utils
from superdesk.metadata.item import not_analyzed

blueprint = Blueprint('wire', __name__)

from . import views  # noqa


def url_for_wire(item, _external=True, section='wire', **kwargs):
    if kwargs:
        return url_for(section, _external=_external, **kwargs)

    route = 'wire' if section in ['wire', 'monitoring'] else 'index'
    return url_for(
        '{}.{}'.format(section, route),
        item=item.get('_id') or item.get('guid') or item.get('item_id'),
        _external=_external
    )


def init_app(app):
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
        },
        'agenda_id': {
            'type': 'string',
            'mapping': not_analyzed,
        },
    })

    superdesk.register_resource('wire_search', WireSearchResource, WireSearchService, _app=app)

    app.section('wire', 'Wire', 'wire')
    app.dashboard('newsroom',
                  gettext('Newsroom'),
                  [
                      '6-text-only',
                      '4-picture-text',
                      '4-media-gallery',
                      '4-photo-gallery',
                      '1x1-top-news',
                      '2x2-top-news',
                      '3-text-only',
                      '3-picture-text',
                      '4-text-only',
                      '2x2-events'
                  ])

    app.sidenav('Home', 'wire.index', 'home')
    app.sidenav('Wire', 'wire.wire', 'text', section='wire')

    app.sidenav(gettext('Saved/Watched Items'), 'wire.bookmarks', 'bookmark',
                group=1, blueprint='wire', badge='saved-items-count')

    from .formatters import TextFormatter, NITFFormatter, NewsMLG2Formatter, JsonFormatter
    app.download_formatter('text', TextFormatter(), gettext('Plain Text'), ['wire', 'agenda'])
    app.download_formatter('nitf', NITFFormatter(), 'NITF', ['wire'])
    app.download_formatter('newsmlg2', NewsMLG2Formatter(), 'NewsMLG2', ['wire'])
    app.download_formatter('json', JsonFormatter(), 'Json', ['agenda'])

    app.add_template_global(utils.get_picture, 'get_picture')
    app.add_template_global(utils.get_caption, 'get_caption')
    app.add_template_global(url_for_wire)

    app.general_setting(
        'news_only_filter',
        gettext('News only filter'),
        weight=200,
        description=gettext("This query defines what is NOT considered 'news' content. It is used by the News only switch to filter the view. When switched on, stories matching this filter will not be displayed.")  # noqa
    )

    app.general_setting(
        'wire_time_limit_days',
        gettext('Time limit for Wire products (in days)'),
        type='number',
        min=0,
        weight=300,
        description=gettext("You can create an additional filter on top of the product definition. The time limit can be enabled for each company in the Permissions."),  # noqa
        default=app.config.get('WIRE_TIME_LIMIT_DAYS', 0),
    )

    app.config.setdefault('WIRE_AGGS', {
        'genre': {'terms': {'field': 'genre.name', 'size': 50}},
        'service': {'terms': {'field': 'service.name', 'size': 50}},
        'subject': {'terms': {'field': 'subject.name', 'size': 20}},
        'urgency': {'terms': {'field': 'urgency'}},
        'place': {'terms': {'field': 'place.name', 'size': 50}},
    })

    app.config.setdefault('WIRE_GROUPS', [
        {
            'field': 'service',
            'label': gettext('Category'),
        },
        {
            'field': 'subject',
            'label': gettext('Subject'),
        },
        {
            'field': 'genre',
            'label': gettext('Content Type'),
        },
        {
            'field': 'urgency',
            'label': gettext('News Value'),
        },
        {
            'field': 'place',
            'label': gettext('Place'),
        },
    ])
