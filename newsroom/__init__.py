"""
Superdesk Newsroom
==================

:license: GPLv3
"""

import superdesk
from newsroom.company_expiry_alerts import CompanyExpiryAlerts
from newsroom.celery_app import celery

from superdesk import register_resource  # noqa

# reuse content api dbs
MONGO_PREFIX = 'CONTENTAPI_MONGO'
ELASTIC_PREFIX = 'CONTENTAPI_ELASTICSEARCH'


class Resource(superdesk.Resource):
    mongo_prefix = MONGO_PREFIX
    elastic_prefix = ELASTIC_PREFIX


class Service(superdesk.Service):
    pass


from newsroom.flaskapp import Newsroom  # noqa


@celery.task(soft_time_limit=600)
def company_expiry():
    CompanyExpiryAlerts().send_alerts()
