
from werkzeug.utils import secure_filename
from flask import render_template, current_app as app
from newsroom.wire.formatters.base import BaseFormatter
from superdesk.utc import utcnow, utc_to_local
from xhtml2pdf import pisa


class MonitoringPDFFormatter(BaseFormatter):
    FILE_EXTENSION = 'pdf'
    MIMETYPE = 'application/pdf'

    def format_filename(self, item):
        attachment_filename = '%s-monitoring-export.pdf' % utcnow().strftime('%Y%m%d%H%M%S')
        return secure_filename(attachment_filename)

    def get_monitoring_file(self, date_items_dict, monitoring_profile):
        if not monitoring_profile or not date_items_dict:
            return

        data = {
            'date_items_dict': date_items_dict,
            'monitoring_profile': monitoring_profile,
            'current_date': utc_to_local(app.config['DEFAULT_TIMEZONE'], utcnow()).strftime('%d/%m/%Y'),
            'monitoring_report_name': app.config.get('MONITORING_REPORT_NAME', 'Newsroom')
        }
        exported_html = str.encode(render_template('monitoring_export.html', **data), 'utf-8')
        pdf_context = pisa.CreatePDF(exported_html)
        _file = pdf_context.dest
        _file.seek(0)
        return _file
