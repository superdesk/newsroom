
import tempfile
import os
from werkzeug.utils import secure_filename
from newsroom.wire.formatters.base import BaseFormatter
from superdesk.utc import utcnow, utc_to_local
from newsroom.monitoring.utils import get_keywords_in_text
from flask import current_app as app
from newsroom.wire import url_for_wire

from PyRTF.Elements import Document, Section, LINE
from PyRTF.document.paragraph import Paragraph
from PyRTF.document.character import TEXT
from PyRTF.object.picture import Image
from binascii import hexlify
from PyRTF.document.base import RawCode
from newsroom.settings import get_settings_collection, GENERAL_SETTINGS_LOOKUP
import logging

logger = logging.getLogger(__name__)


# The Image class in the library does not work so is inherited here.
class LogoImage(Image):

    def __init__(self, file_name, **kwargs):

        fin = open(file_name, 'rb')

        if file_name[-3:].lower() not in ['png', 'jpg']:
            raise Exception('Unknown file type must be either "png" or "jpg"')

        pict_type = self.PICT_TYPES[file_name[-3:].lower()]
        if pict_type == self.PNG_LIB:
            width, height = self._get_png_dimensions(fin.read(100))
        else:
            width, height = self._get_jpg_dimensions(fin)

        codes = [
            pict_type, 'picwgoal%s' % (width * 20),
            'pichgoal%s' % (height * 20)
        ]
        for kwarg, code, default in [('scale_x', 'scalex', '100'), (
                'scale_y', 'scaley', '100'), ('crop_left', 'cropl', '0'), (
                    'crop_right', 'cropr', '0'), ('crop_top', 'cropt', '0'),
                                     ('crop_bottom', 'cropb', '0')]:
            codes.append('pic%s%s' % (code, kwargs.pop(kwarg, default)))

        #  reset back to the start of the file to get all of it and now
        #  turn it into hex.
        fin.seek(0, 0)
        data = []
        image = hexlify(fin.read())
        for i in range(0, len(image), 128):
            data.append(image[i:i + 128].decode('utf-8'))

        data = r'{\pict{\%s}%s}' % ('\\'.join(codes), '\n'.join(data))
        RawCode.__init__(self, data)

    def _get_png_dimensions(self, data):

        _PNG_HEADER = b'\x89\x50\x4e'

        if data[0:3] != _PNG_HEADER:
            raise Exception('Invalid PNG image')

        width = (data[18] * 256) + (data[19])
        height = (data[22] * 256) + (data[23])
        return width, height

    def _get_jpg_dimensions(self, fin):
        """
        converted from: http://dev.w3.org/cvsweb/Amaya/libjpeg/rdjpgcom.c?rev=1.2
        """

        m_sof0 = b'\xC0'  # /* Start Of Frame N */
        m_sof1 = b'\xC1'  # /* N indicates which compression process */
        m_sof2 = b'\xC2'  # /* Only SOF0-SOF2 are now in common use */
        m_sof3 = b'\xC3'  #
        m_sof5 = b'\xC5'  # /* NB: codes C4 and CC are NOT sof markers */
        m_sof6 = b'\xC6'  #
        m_sof7 = b'\xC7'  #
        m_sof9 = b'\xC9'  #
        m_sof10 = b'\xCA'  #
        m_sof11 = b'\xCB'  #
        m_sof13 = b'\xCD'  #
        m_sof14 = b'\xCE'  #
        m_sof15 = b'\xCF'  #

        m_soi = b'\xD8'  # /* Start Of Image (beginning of datastream) */

        m_ff = b'\xFF'

        MARKERS = [
            m_sof0, m_sof1, m_sof2, m_sof3, m_sof5, m_sof6, m_sof7, m_sof9,
            m_sof10, m_sof11, m_sof13, m_sof14, m_sof15
        ]

        def get_length():
            b1 = fin.read(1)
            b2 = fin.read(1)
            return (int.from_bytes(b1, 'big') << 8) + int.from_bytes(b2, 'big')

        def next_marker():
            #  markers come straight after an 0xFF so skip everything
            #  up to the first 0xFF that we find
            while fin.read(1) != m_ff:
                pass

            #  there can be more than one 0xFF as they can be used
            #  for padding so we are now looking for the first byte
            #  that isn't an 0xFF, this will be the marker
            while True:
                result = fin.read(1)
                if result != m_ff:
                    return result

            raise Exception('Invalid JPEG')

        #  BODY OF THE FUNCTION
        if not ((fin.read(1) == m_ff) and (fin.read(1) == m_soi)):
            raise Exception('Invalid Jpeg')

        while True:
            marker = next_marker()

            #  the marker is always followed by two bytes representing the length of the data field
            length = get_length()
            if length < 2:
                raise Exception("Erroneous JPEG marker length")

            #  if it is a compression process marker then it will contain the dimension of the image
            if marker in MARKERS:
                #  the next byte is the data precision, just skip it
                fin.read(1)

                #  bingo
                image_height = get_length()
                image_width = get_length()
                return image_width, image_height

            #  just skip whatever data it contains
            fin.read(length - 2)

        raise Exception('Invalid JPEG, end of stream reached')


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
            p3.append(LINE, LINE, RawCode(r'{\field {\*\fldinst HYPERLINK "'
                      + url_for_wire(item, True, section='monitoring') + r'"}{\fldrslt{\ul View Article}}}'))
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

        general_settings = get_settings_collection().find_one(GENERAL_SETTINGS_LOOKUP)
        if general_settings and general_settings['values'].get('monitoring_report_logo_path'):
            image_filename = general_settings['values'].get('monitoring_report_logo_path')
            if os.path.exists(image_filename):
                try:
                    image = LogoImage(general_settings['values'].get('monitoring_report_logo_path'))
                    section.append(Paragraph(image))
                except Exception as e:
                    logger.exception(e)
                    logger.error('Failed to open logo image {}'.format(image_filename))
            else:
                logger.error('Unable to find logo image {}'.format(image_filename))

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
