import flask
from .base import BaseFormatter
from lxml import html as lxml_html
from superdesk.etree import to_string
from .utils import remove_internal_renditions, log_media_downloads, remove_unpermissioned_embeds
import re
from ...upload import ASSETS_RESOURCE
import base64


class HTMLMediaFormatter(BaseFormatter):

    FILE_EXTENSION = 'html'
    MIMETYPE = 'text/html'

    def get_base64image(self, marker, item):
        widest = -1
        src_rendition = ""
        for rendition in item.get("associations").get(marker).get("renditions"):
            width = item.get("associations").get(marker).get("renditions").get(rendition).get("width")
            if width > widest:
                widest = width
                src_rendition = rendition

        src = item.get("associations").get(marker).get("renditions").get(src_rendition).get("media")
        mimetype = item.get("associations").get(marker).get("renditions").get(src_rendition).get("mimetype")
        file = flask.current_app.media.get(src, ASSETS_RESOURCE)
        b64 = "data:{};base64,".format(mimetype) + base64.b64encode(file.read()).decode()

        return b64

    def get_base64href(self, marker, item):
        src = item.get("associations").get(marker).get("renditions").get("original").get("media")
        mimetype = item.get("associations").get(marker).get("renditions").get("original").get("mimetype")
        file = flask.current_app.media.get(src, ASSETS_RESOURCE)
        b64 = "data:{};base64,".format(mimetype) + base64.b64encode(file.read()).decode()
        return b64

    def rewire_embeded_images(self, item):

        # parse out any editor embeds in the item and re-point to the required rendition
        regex = r" EMBED START (?:Image|Video|Audio) {id: \"editor_([0-9]+)"
        html_updated = False
        root_elem = lxml_html.fromstring(item.get('body_html', ''))
        comments = root_elem.xpath('//comment()')
        for comment in comments:
            m = re.search(regex, comment.text)
            if m and m.group(1):
                # Assumes the sibling of the Embed Image comment is the figure tag containing the image
                figure_elem = comment.getnext()
                if figure_elem is not None and figure_elem.tag == "figure":
                    image_elem = figure_elem.find("./img")
                    if image_elem is not None:
                        embed_id = "editor_" + m.group(1)
                        image_elem.attrib["id"] = embed_id
                        src = self.get_base64image(embed_id, item)
                        if src:
                            image_elem.attrib["src"] = src
                        html_updated = True

                    elem = (
                        figure_elem.find("./audio")
                        if figure_elem.find("./audio") is not None
                        else figure_elem.find("./video")
                    )
                    if elem is not None:
                        embed_id = "editor_" + m.group(1)
                        elem.attrib["id"] = embed_id
                        src = self.get_base64href(embed_id, item)
                        if src:
                            elem.attrib["src"] = src
                            html_updated = True
                        elem.attrib.pop("alt", None)
                        elem.attrib.pop("width", None)
                        elem.attrib.pop("height", None)

        if html_updated:
            item["body_html"] = to_string(root_elem, method="html")

    def rewire_featuremedia(self, item):
        """
        Set the references in the feature media to base64 encoded versions
        :param item:
        :return:
        """
        renditions = item.get('associations', {}).get('featuremedia', {}).get('renditions', [])
        for rendition in renditions:
            src = item.get("associations").get('featuremedia').get("renditions").get(rendition).get("media")
            mimetype = item.get("associations").get('featuremedia').get("renditions").get(rendition).get("mimetype")
            file = flask.current_app.media.get(src, ASSETS_RESOURCE)
            item['associations']['featuremedia']['renditions'][rendition]['href'] = "data:{};base64,".format(
                mimetype) + base64.b64encode(file.read()).decode()

    def format_item(self, item, item_type='items'):
        remove_unpermissioned_embeds(item)
        remove_internal_renditions(item)
        self.rewire_embeded_images(item)
        self.rewire_featuremedia(item)
        log_media_downloads(item)
        return str.encode(flask.render_template('download_embed.html', item=item), 'utf-8')
