import superdesk

from flask_babel import gettext
from superdesk.resource import not_analyzed
from newsroom.signals import publish_item
from eve_elastic.elastic import parse_date
from copy import copy

STT_FIELDS = ['sttdepartment', 'sttversion', 'sttgenre', 'sttdone1']


def get_previous_version(app, guid, version):
    for i in range(int(version) - 1, 1, -1):
        id = "{}:{}".format(guid, i)
        original = app.data.find_one('wire_search', req=None, _id=id)
        if original:
            return original

    return app.data.find_one('wire_search', req=None, _id=guid)


def on_publish_item(app, item, is_new, **kwargs):
    """Populate stt department and version fields."""
    if item.get('subject'):
        for subject in item['subject']:
            if subject.get('scheme', '') in STT_FIELDS:
                item[subject['scheme']] = subject.get('name', subject.get('code'))
        item['subject'] = [subject for subject in item['subject'] if subject.get('scheme') != 'sttdone1']

    # add private note to ednote
    if item.get('extra', {}).get('sttnote_private'):
        if item.get('ednote'):
            item['ednote'] = '{}\n{}'.format(item['ednote'], item['extra']['sttnote_private'])
        else:
            item['ednote'] = item['extra']['sttnote_private']

    # set versioncreated for archive items
    if item.get('firstpublished') and is_new:
        if isinstance(item.get('firstpublished'), str):
            firstpublished = parse_date(item['firstpublished'])
        else:
            firstpublished = item['firstpublished']

        if firstpublished < item['versioncreated']:
            item['versioncreated'] = firstpublished

    # link the previous versions and update the id of the story
    if not is_new and 'evolvedfrom' not in item:
        original = get_previous_version(app, item['guid'], item['version'])

        if original:
            if original.get('version') == item['version']:
                # the same version of the story been sent again so no need to create new version
                return

            service = superdesk.get_resource_service('content_api')
            new_id = '{}:{}'.format(item['guid'], item['version'])
            service.system_update(original['_id'], {'nextversion': new_id}, original)
            item['guid'] = new_id
            item['ancestors'] = copy(original.get('ancestors', []))
            item['ancestors'].append(original['_id'])
            item['bookmarks'] = original.get('bookmarks', [])


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
            'field': 'genre',
            'label': gettext('Genre'),
        },
        {
            'field': 'sttversion',
            'label': gettext('Version'),
        },
    ]
