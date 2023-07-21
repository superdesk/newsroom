import flask
from .base import BaseFormatter
from .utils import remove_internal_renditions, rewire_featuremedia, log_media_downloads, remove_unpermissioned_embeds
from newsroom.utils import update_embeds_in_body
from superdesk.logging import logger


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

        def update_image(item, elem, group):
            embed_id = "editor_" + group
            elem.attrib["id"] = embed_id
            src = _get_source_ref(embed_id, item)
            if src:
                elem.attrib["src"] = src
            srcset = _get_source_set_refs(embed_id, item)
            if srcset:
                elem.attrib["srcset"] = srcset
                elem.attrib["sizes"] = "80vw"
            return True

        def update_video_or_audio(item, elem, group):
            embed_id = "editor_" + group
            elem.attrib["id"] = embed_id
            elem.attrib["src"] = item.get("associations").get(embed_id).get("renditions").get(
                "original").get("href").lstrip('/')
            elem.attrib.pop("alt", None)
            elem.attrib.pop("width", None)
            elem.attrib.pop("height", None)
            return True

        update_embeds_in_body(item, update_image, update_video_or_audio, update_video_or_audio)

    def format_item(self, item, item_type='items'):
        remove_unpermissioned_embeds(item)
        remove_internal_renditions(item, remove_media=False)
        self.rewire_embeded_images(item)
        rewire_featuremedia(item)
        log_media_downloads(item)
        return str.encode(flask.render_template('download_embed.html', item=item), 'utf-8')
