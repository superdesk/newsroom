# -*- coding: utf-8; -*-
#
# This file is part of Superdesk.
#
# Copyright 2013, 2014 Sourcefabric z.u. and contributors.
#
# For the full copyright and license information, please see the
# AUTHORS and LICENSE files distributed with this source code, or
# at https://www.sourcefabric.org/superdesk/license

from superdesk.tests.environment import setup_before_all, setup_before_scenario
from newsroom.news_api.app import get_app
from newsroom.news_api.settings import CORE_APPS


def before_all(context):
    config = {
        'CORE_APPS': CORE_APPS,
        'ELASTICSEARCH_FORCE_REFRESH': True,
        'NEWS_API_ENABLED': True,
        'NEWS_API_IMAGE_PERMISSIONS_ENABLED': True,
        'NEWS_API_TIME_LIMIT_DAYS': 100
    }
    setup_before_all(context, config, app_factory=get_app)


def before_scenario(context, scenario):
    config = {
        'CORE_APPS': CORE_APPS,
        'ELASTICSEARCH_FORCE_REFRESH': True,
        'NEWS_API_ENABLED': True,
        'NEWS_API_IMAGE_PERMISSIONS_ENABLED': True,
        'NEWS_API_TIME_LIMIT_DAYS': 100,
        'NEWS_API_ALLOWED_RENDITIONS': 'original,16-9'
    }

    if 'rate_limit' in scenario.tags:
        config['RATE_LIMIT_PERIOD'] = 300  # 5 minutes
        config['RATE_LIMIT_REQUESTS'] = 2

    setup_before_scenario(context, scenario, config, app_factory=get_app)
