
from lxml import etree
from superdesk.publish.formatters.nitf_formatter import NITFFormatter


class NITFFormatter():

    encoding = 'utf-8'
    formatter = NITFFormatter()

    def format_filename(self, item):
        return '{}.xml'.format(item['_id'])

    def format_item(self, item, item_type='items'):
        dest = {}
        nitf = self.formatter.get_nitf(item, dest, '')
        return etree.tostring(nitf, xml_declaration=True, pretty_print=True, encoding=self.encoding)
