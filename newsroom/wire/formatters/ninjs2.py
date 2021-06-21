from .ninjs import NINJSFormatter
from newsroom.news_api.utils import remove_internal_renditions, check_association_permission


class NINJSFormatter2(NINJSFormatter):
    """
    Overload the NINJSFormatter and add the associations as a field to copy
    """

    def __init__(self):
        self.direct_copy_properties += ('associations',)

    def _transform_to_ninjs(self, item):
        if not check_association_permission(item):
            item.pop('associations', None)
        return remove_internal_renditions(super()._transform_to_ninjs(item))
