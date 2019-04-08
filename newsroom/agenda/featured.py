
from superdesk.utc import local_to_utc
from newsroom import Resource, Service
from datetime import datetime


class FeaturedResource(Resource):
    schema = {
        '_id': {'type': 'string', 'unique': True},
        'tz': {'type': 'string'},
        'items': {'type': 'list'},
        'display_from': {'type': 'datetime'},
        'display_to': {'type': 'datetime'},
    }


class FeaturedService(Service):

    def create(self, docs):
        """Add UTC from/to datetimes on save.

        Problem is 31.8. in Sydney is from 30.8. 14:00 UTC to 31.8. 13:59 UTC.
        And because we query later using UTC, we store those UTC datetimes as
        display_from and display_to.
        """
        for item in docs:
            date = datetime.strptime(item['_id'], '%Y%m%d')
            item['display_from'] = local_to_utc(item['tz'], date.replace(hour=0, minute=0, second=0))
            item['display_to'] = local_to_utc(item['tz'], date.replace(hour=23, minute=59, second=59))
        super().create(docs)

    def find_one_for_date(self, for_date):
        return self.find_one(req=None, display_from={'$lte': for_date}, display_to={'$gte': for_date})
