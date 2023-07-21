from .ninjs import NINJSFormatter
from newsroom.news_api.utils import check_featuremedia_association_permission
from newsroom.wire.formatters.utils import remove_internal_renditions


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
