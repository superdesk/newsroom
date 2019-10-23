# -*- coding: utf-8; -*-
#
# This file is part of Superdesk.
#
# Copyright 2013, 2014 Sourcefabric z.u. and contributors.
#
# For the full copyright and license information, please see the
# AUTHORS and LICENSE files distributed with this source code, or
# at https://www.sourcefabric.org/superdesk/license

from superdesk.tests.steps import *  # noqa
from behave import when


@when('we save API token')
def step_save_token(context):
    context.headers.append(('Authorization', context.news_api_tokens.get('_id')))
    return
