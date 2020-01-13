# -*- coding: utf-8; -*-
#
# This file is part of Superdesk.
#
# Copyright 2013, 2014 Sourcefabric z.u. and contributors.
#
# For the full copyright and license information, please see the
# AUTHORS and LICENSE files distributed with this source code, or
# at https://www.sourcefabric.org/superdesk/license

from superdesk.tests.steps import apply_placeholders, json_match
from behave import when, then
import json


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
