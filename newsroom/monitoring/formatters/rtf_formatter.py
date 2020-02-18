
import tempfile
from werkzeug.utils import secure_filename
from newsroom.wire.formatters.base import BaseFormatter
from superdesk.utc import utcnow, utc_to_local
from newsroom.monitoring.utils import get_keywords_in_text
from flask import current_app as app
from newsroom.wire import url_for_wire

from PyRTF.Elements import Document, Section, LINE
from PyRTF.document.paragraph import Paragraph
from PyRTF.document.character import TEXT


class MonitoringRTFFormatter(BaseFormatter):

    FILE_EXTENSION = 'rtf'
    MIMETYPE = 'application/rtf'

    def format_item(self, item, styles, monitoring_profile, section):
        keywords = get_keywords_in_text(item.get('body_str'), (monitoring_profile or {}).get('keywords', []))

        p2 = Paragraph(styles.ParagraphStyles.Normal)
        p2.append(LINE, TEXT('Headline: {}'.format(item.get('headline')), bold=True))
        p2.append(LINE, TEXT('Source: {}'.format(item.get('source')), bold=True))
        p2.append(LINE, TEXT('Keywords: {}'.format(', '.join(keywords)), bold=True))
        if item.get('byline'):
            p2.append(LINE, ('By ' + item['byline']))

        p3 = Paragraph(styles.ParagraphStyles.Normal)
        body_lines = item.get('body_str', '').split('\n')
        for line in body_lines:
            p3.append(line, LINE, LINE)

        if monitoring_profile['alert_type'] == 'linked_text':
            p3.append(LINE, LINE, 'View article: {}'.format(url_for_wire(item, True, section='monitoring')))

        section.append(p2)
        section.append(p3)

    def format_filename(self, item):
        attachment_filename = '%s-monitoring-export.rtf' % utcnow().strftime('%Y%m%d%H%M%S')
        return secure_filename(attachment_filename)

    def get_monitoring_file(self, date_items_dict, monitoring_profile=None):
        _file = tempfile.NamedTemporaryFile()
        if not date_items_dict:
            return _file

        current_date = utc_to_local(app.config['DEFAULT_TIMEZONE'], utcnow()).strftime('%d/%m/%Y')
        doc = Document()
        section = Section()
        ss = doc.StyleSheet
        p1 = Paragraph(ss.ParagraphStyles.Heading1)
        p1.append('{} Monitoring: {} ({})'.format(app.config.get('MONITORING_REPORT_NAME', 'Newsroom'),
                                                  monitoring_profile['name'], current_date))
        section.append(p1)

        for d in date_items_dict.keys():
            date_p = Paragraph(ss.ParagraphStyles.Normal)
            date_p.append(LINE, d.strftime('%d/%m/%Y'))
            section.append(date_p)
            for item in date_items_dict[d]:
                self.format_item(item, ss, monitoring_profile, section)

        doc.Sections.append(section)
        app.customize_rtf_file(doc)

        doc.write(_file.name)
        return _file
