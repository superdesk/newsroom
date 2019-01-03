from datetime import timedelta
from flask_babel import gettext
from eve_elastic.elastic import parse_date

from superdesk.utc import utcnow
from superdesk.resource import not_analyzed
from newsroom.signals import publish_item


STT_FIELDS = ['sttdepartment', 'sttversion', 'sttgenre', 'sttdone1']


def on_publish_item(app, item, **kwargs):
    """Populate stt department and version fields."""
    if item.get('subject'):
        for subject in item['subject']:
            if subject.get('scheme', '') in STT_FIELDS:
                item[subject['scheme']] = subject.get('name', subject.get('code'))
        item['subject'] = [subject for subject in item['subject'] if subject.get('scheme') != 'sttdone1']

    # set versioncreated for archive items
    if item.get('firstpublished'):
        firstpublished = parse_date(item['firstpublished'])
        if firstpublished < item['versioncreated'] and firstpublished < utcnow() - timedelta(days=7):
            item['versioncreated'] = firstpublished


def init_app(app):
    publish_item.connect(on_publish_item)

    # add extra fields to elastic mapping
    for field in STT_FIELDS:
        for resource in ('items', 'content_api'):
            app.config['DOMAIN'][resource]['schema'].update({
                field: {'type': 'string', 'mapping': not_analyzed},
            })

            app.config['SOURCES'][resource]['projection'].update({
                field: 1,
            })

        app.config['WIRE_AGGS'].update({
            field: {'terms': {'field': field, 'size': 50}},
        })

    app.config['WIRE_GROUPS'] = [
        {
            'field': 'sttdepartment',
            'label': gettext('Department'),
        },
        {
            'field': 'sttgenre',
            'label': gettext('Genre'),
        },
        {
            'field': 'sttversion',
            'label': gettext('Version'),
        },
    ]
