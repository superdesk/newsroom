"""
Superdesk Newsroom
==================

:license: GPLv3
"""

# reuse content api dbs
MONGO_PREFIX = 'CONTENTAPI_MONGO'
ELASTIC_PREFIX = 'CONTENTAPI_ELASTICSEARCH'

from newsroom.flaskapp import Newsroom  # noqa
