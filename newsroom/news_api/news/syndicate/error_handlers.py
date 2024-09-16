from typing import Union, Mapping, Dict
from flask import request, make_response, jsonify


def handle_unsupported_format(data, formatter=None):
    error_message = f"Unsupported formatter: {formatter if formatter is not None else ''} "
    error_response = make_response(jsonify({'error': error_message}), 400)
    return process_error_response(error_response)


def process_error_response(response):
    error_message: Union[bytes, str] = response.data.decode(
        'utf-8') if response.data else 'error message empty,contact admin for log information'

    def syndicate_examples() -> Mapping[str, str]:
        examples = {
            'json': (
                f"{request.url_root}syndicate?format=json&q=trump&start_date=2020-04-01"
                f"&timezone=Australia/Sydney"
            ),
            'atom': (
                f"{request.url_root}syndicate?format=atom&start_date=now-30d&end_date=now"
                f"&timezone=Australia/Sydney&include_fields=headline,byline,slugline,description_html,"
                f"located,keywords,source,subject,place,wordcount,charcount,body_html,readtime,profile,"
                f"service,genre,associations"
            ),
            'rss': (
                f"{request.url_root}syndicate?format=rss&exclude_fields=version,versioncreated,"
                f"firstcreated"
            )
        }
        return examples

    def syndicate_parameters() -> Dict[str, str]:
        parameters = {
            'format': "Specifies the desired format of the response. Accepts 'json', 'atom', or 'rss'.",
            # ... (other parameters) ...
        }
        return parameters

    error_payload: Dict[str, Dict[str, Union[int, str, Dict[str, str], Mapping[str, str]]]] = {
        "error": {
            "code": response.status_code,
            "message": error_message,
        },
        "usage": {
            "endpoint": str(request.url),
            "method": request.method,
            "description": "This API endpoint allows formats (JSON, ATOM, RSS).",
            "parameters": syndicate_examples(),
            "examples": syndicate_parameters(),
        },
    }
    return jsonify(error_payload)
