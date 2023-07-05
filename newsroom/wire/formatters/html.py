import flask
from .base import BaseFormatter
from lxml import html as lxml_html
from lxml.html import clean
from lxml import etree


class HTMLFormatter(BaseFormatter):
    """
    Formatter that allows the download of "plain" html with any embeds in the html body stripped
    """

    FILE_EXTENSION = 'html'
    MIMETYPE = 'text/html'

    def format_item(self, item, item_type='items'):

        # clean all the embedded figures from the html
        blacklist = ["figure"]
        root_elem = lxml_html.fromstring(item.get("body_html", ""))
        cleaner = clean.Cleaner(
            add_nofollow=False,
            kill_tags=blacklist
        )
        cleaned_xhtml = cleaner.clean_html(root_elem)

        item["body_html"] = etree.tostring(cleaned_xhtml, encoding="unicode", method='html')

        if item_type == 'items':
            return str.encode(flask.render_template('download_item.html', item=item), 'utf-8')
        else:
            return str.encode(flask.render_template('download_agenda.txt', item=item), 'utf-8')
