# -*- coding: utf-8; -*-
# This file is part of Superdesk.
# For the full copyright and license information, please see the
# AUTHORS and LICENSE files distributed with this source code, or
# at https://www.sourcefabric.org/superdesk/license
#
# Author  : superdesk
# Creation: 2020-03-05 13:52

from superdesk.commands.data_updates import DataUpdate as _DataUpdate
from bson import ObjectId


class DataUpdate(_DataUpdate):

    resource = 'agenda'

    def forwards(self, mongodb_collection, mongodb_database):
        for agenda in mongodb_collection.find({'coverages.watches': {'$exists': True}}):
            coverages = agenda.get('coverages', [])
            updated = False
            for coverage in coverages:
                if len(coverage.get('watches') or []) > 0:
                    coverage['watches'] = [ObjectId(w) for w in coverage['watches']]
                    updated = True

            if updated:
                print(mongodb_collection.update(
                    {'_id': agenda['_id']},
                    {'$set': {'coverages': coverages}}
                ))

    def backwards(self, mongodb_collection, mongodb_database):
        pass
