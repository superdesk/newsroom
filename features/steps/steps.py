# -*- coding: utf-8; -*-
#
# This file is part of Superdesk.
#
# Copyright 2013, 2014 Sourcefabric z.u. and contributors.
#
# For the full copyright and license information, please see the
# AUTHORS and LICENSE files distributed with this source code, or
# at https://www.sourcefabric.org/superdesk/license

from superdesk.tests.steps import apply_placeholders, json_match, get_json_data
from superdesk.tests import set_placeholder
from behave import when, then
from newsroom.settings import get_settings_collection
import json
import lxml
from wooper.general import (
    get_body
)
import logging


@when('we save API token')
def step_save_token(context):
    context.headers.append(('Authorization', context.news_api_tokens.get('_id')))
    return


@when('we set header "{name}" to value "{value}"')
def step_set_header(context, name, value):
    context.headers.append((name, value))


@then('we get headers in response')
def step_assert_response_header(context):
    test_headers = json.loads(apply_placeholders(context, context.text))
    response_headers = context.response.headers
    headers_dict = {}

    for h in response_headers:
        headers_dict[h[0]] = h[1]

    for t_h in test_headers:
        json_match(t_h, headers_dict)


@then('we store NEXT_PAGE from HATEOAS')
def step_store_next_page_from_response(context):
    data = get_json_data(context.response)
    href = ((data.get('_links') or {}).get('next_page') or {}).get('href')
    assert href, data
    set_placeholder(context, 'NEXT_PAGE', href)


@then('we get "{text}" in text response')
def we_get_text_in_response(context, text):
    with context.app.test_request_context(context.app.config['URL_PREFIX']):
        assert (isinstance(get_body(context.response), str))
        assert (text in get_body(context.response))


@when('we set api time limit to {value}')
def we_set_api_time_limit(context, value):
    with context.app.test_request_context():
        get_settings_collection().insert_one({"_id": "general_settings", "values": {"news_api_time_limit_days": value}})


@then('we "{get}" "{text}" in atom xml response')
def we_get_text_in_atom_xml_response(context, get, text):
    with context.app.test_request_context(context.app.config['URL_PREFIX']):
        assert (isinstance(get_body(context.response), str))
        tree = lxml.etree.fromstring(get_body(context.response).encode('utf-8'))
        assert '{http://www.w3.org/2005/Atom}feed' == tree.tag
        if get == 'get':
            assert (text in get_body(context.response))
        else:
            assert (text not in get_body(context.response))


@then('we "{get}" "{text}" in syndicate xml response')
def we_get_text_in_syndicate_xml_response(context, get, text):
    with context.app.test_request_context(context.app.config['URL_PREFIX']):
        response_body = get_body(context.response)
        logging.info("Response body: %s", response_body)
        assert (isinstance(get_body(context.response), str))
        try:
            tree = lxml.etree.fromstring(response_body.encode('utf-8'))
            assert '{http://www.w3.org/2005/Atom}feed' == tree.tag
            if get == 'get':
                assert (text in response_body)
            else:
                assert (text not in response_body)
        except lxml.etree.XMLSyntaxError as e:
            logging.error("XML parsing error: %s", e)
            raise AssertionError("Response is not valid XML")
