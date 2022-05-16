from flask import current_app as app
import collections
from superdesk.text_utils import get_text
from newsroom.utils import get_items_by_id
from superdesk import etree as sd_etree


DELAYED_INTERVALS = ['one_hour', 'two_hour', 'four_hour', 'weekly', 'daily']
IMMEDIATE_INTERVAL = 'immediate'
SCHEDULE_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']


def get_monitoring_file(monitoring_profile, items):
    _format = monitoring_profile.get('format_type', 'monitoring_pdf')
    formatter = app.download_formatters[_format]['formatter']
    _file = formatter.get_monitoring_file(get_date_items_dict(items), monitoring_profile)
    _file.seek(0)
    return _file


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


def clean_html(body_html):
    '''
    Make sure the html will parse and inject \r\n in an attempt to avoid issues with lines being too long for SMTP
    :param body_html:
    :return: parsed and re-written html
    '''
    root = sd_etree.parse_html(body_html, content='html', lf_on_block=True)
    return sd_etree.to_string(root, method='html', pretty_print=True).replace('>\n', '>\r\n')


def truncate_article_body(items, monitoring_profile, full_text=False):
    # To make sure PDF creator and RTF creator does truncate for linked_text settings
    # Manually truncate it
    for i in items:
        i['body_str'] = get_text(i.get('body_html', ''), content='html', lf_on_block=True)
        if monitoring_profile['alert_type'] == 'linked_text':
            if not full_text and len(i['body_str']) > 160:
                i['body_str'] = i['body_str'][:159] + '...'

        if monitoring_profile.get('format_type') == 'monitoring_pdf':
            body_lines = i.get('body_str', '').split('\n')
            altered_html = ''
            for line in body_lines:
                altered_html = '{}<div class="line">{}</div>'.format(altered_html, line)

            i['body_str'] = altered_html

        if monitoring_profile.get('format_type') == 'monitoring_email':
            i['body_html'] = clean_html(i['body_html'])


def get_items_for_monitoring_report(_ids, monitoring_profile, full_text=False):
    items = get_items_by_id(_ids, 'items')
    truncate_article_body(items, monitoring_profile, full_text)
    return items
