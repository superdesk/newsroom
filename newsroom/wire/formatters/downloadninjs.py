from superdesk.logging import logger
from .ninjs import NINJSFormatter
from .utils import remove_internal_renditions, rewire_featuremedia, log_media_downloads, remove_unpermissioned_embeds
from newsroom.utils import update_embeds_in_body


class NINJSDownloadFormatter(NINJSFormatter):
    """
    Overload the NINJSFormatter and add the associations as a field to copy
    """

    def __init__(self):
        self.direct_copy_properties += ('associations',)

    def rewire_embeded_images(self, item):
        def _get_source_ref(marker, item):
            widest = -1
            src_rendition = ""
            associations = item.get("associations")
            if associations:
                marker_association = associations.get(marker)
                if marker_association:
                    renditions = marker_association.get("renditions")
                    if renditions:
                        for rendition in renditions:
                            width = renditions.get(rendition, {}).get("width")
                            if width and width > widest:
                                widest = width
                                src_rendition = rendition

            if widest > 0 and src_rendition:
                href = associations.get(marker, {}).get("renditions", {}).get(src_rendition, {}).get("href")
                if href:
                    return href.lstrip('/')

            logger.warning("href not found for the original in NINJSDownload formatter")
            return None

        def _get_source_set_refs(marker, item):
            """
            For the given marker (association) return the set of available hrefs and the widths
            :param marker:
            :param item:
            :return:
            """
            srcset = []
            associations = item.get("associations")
            if associations:
                marker_association = associations.get(marker)
                if marker_association:
                    renditions = marker_association.get("renditions")
                    if renditions:
                        for rendition in renditions:
                            href = renditions.get(rendition, {}).get("href")
                            width = renditions.get(rendition, {}).get("width")
                            if href and width:
                                srcset.append(href.lstrip('/') + " " + str(width) + "w")
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
            # cleanup the element to ensure the html will validate
            elem.attrib.pop("alt", None)
            elem.attrib.pop("width", None)
            elem.attrib.pop("height", None)
            return True

        update_embeds_in_body(item, update_image, update_video_or_audio, update_video_or_audio)

    def _transform_to_ninjs(self, item):
        remove_unpermissioned_embeds(item)
        # Remove the renditions we should not be showing the world
        remove_internal_renditions(item, remove_media=False)
        # set the references embedded in the html body of the story
        self.rewire_embeded_images(item)
        rewire_featuremedia(item)
        log_media_downloads(item)
        return super()._transform_to_ninjs(item)
