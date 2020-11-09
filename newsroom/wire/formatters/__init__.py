
formatters = []


def get_all_formatters():
    """Return all formatters registered."""
    return [formatter_cls() for formatter_cls in formatters]


class FormatterRegistry(type):
    """Registry metaclass for formatters."""

    def __init__(cls, name, bases, attrs):
        """Register sub-classes of Formatter class when defined."""
        super(FormatterRegistry, cls).__init__(name, bases, attrs)
        if name != 'BaseFormatter':
            formatters.append(cls)


from .text import TextFormatter  # noqa
from .nitf import NITFFormatter  # noqa
from .newsmlg2 import NewsMLG2Formatter  # noqa
from .json import JsonFormatter  # noqa
from .ninjs import NINJSFormatter  # noqa
from .picture import PictureFormatter  # noqa
from .ninjs2 import NINJSFormatter2  # noqa
