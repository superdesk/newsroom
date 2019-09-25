# -*- coding: utf-8; -*-
# This file is part of Superdesk.
# For the full copyright and license information, please see the
# AUTHORS and LICENSE files distributed with this source code, or
# at https://www.sourcefabric.org/superdesk/license
#
# Author  : Mark Pittaway
# Creation: 2019-09-12 12:22

from eve.utils import config
from superdesk.commands.data_updates import DataUpdate as _DataUpdate


class DataUpdate(_DataUpdate):
    """Converts topic navigations from string to array of strings

    Refer to https://dev.sourcefabric.org/browse/SDAN-581 for more information

    """
    resource = 'topics'

    def forwards(self, mongodb_collection, mongodb_database):
        for topic in mongodb_collection.find({}):
            navigation = topic.get('navigation', None)

            if type(navigation) is list:
                continue

            print(mongodb_collection.update(
                {config.ID_FIELD: topic.get(config.ID_FIELD)},
                {'$set': {'navigation': [] if navigation is None else [navigation]}}
            ))

    def backwards(self, mongodb_collection, mongodb_database):
        for topic in mongodb_collection.find({}):
            navigation = next((iter(topic.get('navigation') or [])), None)

            print(mongodb_collection.update(
                {config.ID_FIELD: topic.get(config.ID_FIELD)},
                {'$set': {'navigation': navigation}}
            ))
