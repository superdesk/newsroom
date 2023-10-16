from .ninjs import NINJSFormatter
from newsroom.news_api.utils import check_featuremedia_association_permission
from newsroom.wire.formatters.utils import remove_internal_renditions
from newsroom.utils import remove_all_embeds


class NINJSFormatter2(NINJSFormatter):
    """
    Overload the NINJSFormatter and add the associations as a field to copy
    """

    def __init__(self):
        self.direct_copy_properties += ('associations',)

    def _transform_to_ninjs(self, item):
        if not check_featuremedia_association_permission(item):
            if item.get('associations', {}).get('featuremedia'):
                item.get('associations').pop('featuremedia')
            if not item.get('associations'):
                item.pop('associations', None)
        return remove_internal_renditions(super()._transform_to_ninjs(item), remove_media=True)


class NINJSFormatter3(NINJSFormatter2):
    """
    Format with no Embeds
    """

    def _transform_to_ninjs(self, item):
        remove_all_embeds(item)
        ninjs = super()._transform_to_ninjs(item)
        return ninjs
