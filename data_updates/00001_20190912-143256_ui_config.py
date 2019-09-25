# -*- coding: utf-8; -*-
# This file is part of Superdesk.
# For the full copyright and license information, please see the
# AUTHORS and LICENSE files distributed with this source code, or
# at https://www.sourcefabric.org/superdesk/license
#
# Author  : Mark Pittaway
# Creation: 2019-09-12 14:32

from eve.utils import config
from superdesk.commands.data_updates import DataUpdate as _DataUpdate


class DataUpdate(_DataUpdate):
    """Adds 'multi_select_topics=false' to all sections in the ui_config"""

    resource = 'ui_config'

    def forwards(self, mongodb_collection, mongodb_database):
        for section in mongodb_collection.find({}):
            print(mongodb_collection.update(
                {config.ID_FIELD: section.get(config.ID_FIELD)},
                {'$set': {'multi_select_topics': False}}
            ))

    def backwards(self, mongodb_collection, mongodb_database):
        for section in mongodb_collection.find({}):
            print(mongodb_collection.update(
                {config.ID_FIELD: section.get(config.ID_FIELD)},
                {'$unset': {'multi_select_topics': 1}}
            ))
