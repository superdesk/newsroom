from collections import defaultdict
from .service import NewsAPISyndicateService
from flask import make_response, jsonify
from .error_handlers import process_error_response


def convert_to_syndicate(data, formatter):
    # remove token  from requirments
    if formatter and formatter == 'ATOM':
        return NewsAPISyndicateService.generate_atom_feed(data)
    elif formatter and formatter == 'RSS':
        return NewsAPISyndicateService.generate_rss_feed(data)
    elif formatter and formatter == 'JSON':
        return jsonify(data)
    else:
        raise ValueError("Invalid formatter specified")


FORMAT_HANDLERS = defaultdict(
    lambda: {'handler': handle_unsupported_format, 'content_type': 'application/json'},
    {
        'ATOM': {'handler': convert_to_syndicate, 'content_type': 'application/xml'},
        'RSS': {'handler': convert_to_syndicate, 'content_type': 'application/xml'},
        'JSON': {'handler': convert_to_syndicate, 'content_type': 'application/json'},
    }
)
FEED_GENERATORS = defaultdict(
    lambda: handle_unsupported_format,
    {
        'atom': NewsAPISyndicateService.generate_atom_feed,
        'rss': NewsAPISyndicateService.generate_rss_feed,
    }
)


def handle_unsupported_format(data, formatter=None):
    if formatter and formatter != 'JSON':
        error_message = f"Unsupported formatter: {formatter if formatter is not None else 'empty value'} "
        error_response = make_response(jsonify({'error': error_message}), 400)
        return process_error_response(error_response)
    return jsonify(data)
