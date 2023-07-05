import flask
from .base import BaseFormatter
from .utils import remove_internal_renditions, rewire_featuremedia, log_media_downloads, remove_unpermissioned_embeds
from lxml import html as lxml_html
from superdesk.etree import to_string
from superdesk.logging import logger
import re


class HTMLPackageFormatter(BaseFormatter):

    FILE_EXTENSION = 'html'
    MIMETYPE = 'text/html'

    def rewire_embeded_images(self, item):

        def _get_source_ref(marker, item):
            widest = -1
            src_rendition = ""
            for rendition in item.get("associations").get(marker).get("renditions"):
                width = item.get("associations").get(marker).get("renditions").get(rendition).get("width")
                if width > widest:
                    widest = width
                    src_rendition = rendition

            if widest > 0:
                return item.get("associations").get(marker).get("renditions").get(src_rendition).get("href").lstrip('/')

            logger.warning(
                "href not found for the original in HTMLPackage formatter")
            return None

        def _get_source_set_refs(marker, item):
            """
            For the given marker (association) return the set of available hrefs and the widths
            :param marker:
            :param item:
            :return:
            """
            srcset = []
            for rendition in item.get("associations").get(marker).get("renditions"):
                ref = item.get("associations").get(marker).get("renditions").get(rendition).get("href").lstrip('/')
                srcset.append(ref + " " + str(
                    item.get("associations").get(marker).get("renditions").get(rendition).get("width")) + "w")
            return ",".join(srcset)

        # parse out any editor embeds in the item and re-point to the required rendition
        regex = r" EMBED START (?:Image|Video|Audio) {id: \"editor_([0-9]+)"
        html_updated = False
        root_elem = lxml_html.fromstring(item.get('body_html', ''))
        comments = root_elem.xpath('//comment()')
        for comment in comments:
            if 'EMBED START ' in comment.text:
                m = re.search(regex, comment.text)
                # Assumes the sibling of the Embed Image comment is the figure tag containing the image
                figure_elem = comment.getnext()
                if figure_elem is not None and figure_elem.tag == "figure":
                    image_elem = figure_elem.find("./img")
                    if image_elem is not None and m and m.group(1):
                        embed_id = "editor_" + m.group(1)
                        image_elem.attrib["id"] = embed_id
                        src = _get_source_ref(embed_id, item)
                        if src:
                            image_elem.attrib["src"] = src
                        html_updated = True
                        srcset = _get_source_set_refs(embed_id, item)
                        if srcset:
                            image_elem.attrib["srcset"] = srcset
                            image_elem.attrib["sizes"] = "80vw"
                            html_updated = True
                    elem = (
                        figure_elem.find("./audio")
                        if figure_elem.find("./audio") is not None
                        else figure_elem.find("./video")
                    )
                    if elem is not None and m and m.group(1):
                        embed_id = "editor_" + m.group(1)
                        elem.attrib["id"] = embed_id
                        elem.attrib["src"] = item.get("associations").get(embed_id).get("renditions").get(
                            "original").get("href").lstrip('/')
                        elem.attrib.pop("alt", None)
                        elem.attrib.pop("width", None)
                        elem.attrib.pop("height", None)
                        html_updated = True

        if html_updated:
            item["body_html"] = to_string(root_elem, method="html")

    def format_item(self, item, item_type='items'):
        remove_unpermissioned_embeds(item)
        remove_internal_renditions(item)
        self.rewire_embeded_images(item)
        rewire_featuremedia(item)
        log_media_downloads(item)
        return str.encode(flask.render_template('download_embed.html', item=item), 'utf-8')
