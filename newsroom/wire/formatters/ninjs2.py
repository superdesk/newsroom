from .ninjs import NINJSFormatter
from newsroom.news_api.utils import remove_internal_renditions


class NINJSFormatter2(NINJSFormatter):
    """
    Overload the NINJSFormatter and add the associations as a field to copy
    """

    def __init__(self):
        self.direct_copy_properties += ('associations',)

    def _transform_to_ninjs(self, item):
        return remove_internal_renditions(super()._transform_to_ninjs(item))
