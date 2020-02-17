from flask_mail import Attachment
from flask import current_app as app
import collections
import tempfile
from superdesk.logging import logger
from superdesk.text_utils import get_text
from newsroom.utils import get_items_by_id


def get_monitoring_file_attachment(monitoring_profile, items, as_temp_file=False):
    _format = monitoring_profile.get('format_type', 'monitoring_pdf')
    formatter = app.download_formatters[_format]['formatter']
    file = formatter.get_monitoring_file(get_date_items_dict(items), monitoring_profile)
    if as_temp_file:
        try:
            _file = tempfile.NamedTemporaryFile(delete=False)
            _file.write(file.read())
            return _file.name
        except Exception as e:
            logger('Error creating tempFile for monitoring profile: {}. Error: {}'.format(
                    monitoring_profile['name']), e)
            return

    fp = file.read()
    attachments = [Attachment(filename=formatter.format_filename(None),
                              content_type='application/{}'.format(formatter.FILE_EXTENSION),
                              data=fp)]
    return attachments


def get_keywords_in_text(text, keywords):
    text_lower_case = text.lower()
    return [k for k in (keywords or []) if k.lower() in text_lower_case]


def get_date_items_dict(items):
    date_items_dict = {}
    for i in items:
        date = i['versioncreated'].date()
        if date in date_items_dict:
            date_items_dict[date].append(i)
        else:
            date_items_dict[date] = [i]

    date_items_dict = collections.OrderedDict(sorted(date_items_dict.items()))
    return date_items_dict


def truncate_article_body(items, monitoring_profile, full_text=False):
    # To make sure PDF creator and RTF creator does truncate for linked_text settings
    # Manually truncate it
    for i in items:
        i['body_str'] = get_text(i.get('body_html', ''), content='html', lf_on_block=True)
        if monitoring_profile['alert_type'] == 'linked_text':
            if not full_text and len(i['body_str']) > 160:
                i['body_str'] = i['body_str'][:159] + '...'
                if monitoring_profile.get('format_type') == 'monitoring_pdf':
                    i['body_str'] = i['body_str'].replace("\n", "</br>")


def get_items_for_monitoring_report(_ids, monitoring_profile, full_text=False):
    items = get_items_by_id(_ids, 'items')
    truncate_article_body(items, monitoring_profile, full_text)
    return items
