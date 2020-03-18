
from lxml import etree
from superdesk.publish.formatters.nitf_formatter import NITFFormatter as SuperdeskNITFFormatter

from .base import BaseFormatter


class NITFFormatter(BaseFormatter):

    MIMETYPE = 'application/vnd.nitf'
    FILE_EXTENSION = 'xml'

    encoding = 'utf-8'
    formatter = SuperdeskNITFFormatter()

    def _format_docdata_doc_id_source(self, article, docdata):
        elem = docdata.find('.//head/docdata/doc-id')
        if elem is not None:
            elem.set('regsrc', article.get('source', ''))

    def format_item(self, item, item_type='items'):
        dest = {}
        nitf = self.formatter.get_nitf(item, dest, '')
        self._format_docdata_doc_id_source(item, nitf)
        return etree.tostring(nitf, xml_declaration=True, pretty_print=True, encoding=self.encoding)
