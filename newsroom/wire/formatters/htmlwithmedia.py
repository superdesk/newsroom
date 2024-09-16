import flask
from .base import BaseFormatter
from .utils import remove_internal_renditions, log_media_downloads, remove_unpermissioned_embeds
from newsroom.utils import update_embeds_in_body
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

    def rewire_embedded_images(self, item):

        def update_image(item, elem, group):
            embed_id = "editor_" + group
            elem.attrib["id"] = embed_id
            src = self.get_base64image(embed_id, item)
            if src:
                elem.attrib["src"] = src
            return True

        def update_video_or_audio(item, elem, group):
            embed_id = "editor_" + group
            elem.attrib["id"] = embed_id
            src = self.get_base64href(embed_id, item)
            if src:
                elem.attrib["src"] = src
            elem.attrib.pop("alt", None)
            elem.attrib.pop("width", None)
            elem.attrib.pop("height", None)
            return True

        update_embeds_in_body(item, update_image, update_video_or_audio, update_video_or_audio)

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
        self.rewire_embedded_images(item)
        self.rewire_featuremedia(item)
        log_media_downloads(item)
        return str.encode(flask.render_template('download_embed.html', item=item), 'utf-8')
