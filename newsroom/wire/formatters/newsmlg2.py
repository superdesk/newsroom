
from lxml import etree
from flask import current_app as app

from superdesk.publish.formatters.nitf_formatter import NITFFormatter
from superdesk.publish.formatters.newsml_g2_formatter import NewsMLG2Formatter as SuperdeskFormatter

from .base import BaseFormatter


class NewsroomFormatter(SuperdeskFormatter):

    def _format_rights(self, newsItem, article):
        """Override superdesk implementation which reads it from db."""
        rights = {
            'copyrightholder': app.config.get('COPYRIGHT_HOLDER', 'Newsroom'),
            'copyrightnotice': app.config.get('COPYRIGHT_NOTICE', ''),
            'usageterms': app.config.get('USAGE_TERMS', ''),
        }
        rightsinfo = etree.SubElement(newsItem, 'rightsInfo')
        holder = etree.SubElement(rightsinfo, 'copyrightHolder')
        etree.SubElement(holder, 'name').text = rights['copyrightholder']
        etree.SubElement(rightsinfo, 'copyrightNotice').text = rights['copyrightnotice']
        etree.SubElement(rightsinfo, 'usageTerms').text = rights['usageterms']


class NewsMLG2Formatter(BaseFormatter):

    MIMETYPE = 'application/vnd.iptc.g2.newsitem+xml'
    FILE_EXTENSION = 'xml'

    encoding = 'utf-8'
    formatter = NewsroomFormatter()
    nitf_formatter = NITFFormatter()

    def format_item(self, item):
        item = item.copy()
        item.setdefault('guid', item['_id'])
        item.setdefault('_current_version', item['version'])
        item.setdefault('state', '')
        news_message = etree.Element('newsMessage',
                                     attrib=self.formatter._debug_message_extra,
                                     nsmap=self.formatter._message_nsmap)
        self.formatter._format_header(item, news_message, '')
        item_set = self.formatter._format_item(news_message)
        news_item = self.formatter._format_item_set(item, item_set, 'newsItem')
        nitf = self.nitf_formatter.get_nitf(item, {}, '')
        self.formatter._format_content(item, news_item, nitf)
        return etree.tostring(news_message, xml_declaration=True, pretty_print=True, encoding=self.encoding)
