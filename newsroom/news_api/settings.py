import os
from superdesk.default_settings import env

URL_PREFIX = os.environ.get('CONTENT_API_PREFIX', 'api/v1')
QUERY_MAX_PAGE_SIZE = 100

CORE_APPS = [
    'newsroom.news_api',
    'newsroom.news_api.api_tokens',
    'newsroom.companies',
    'newsroom.news_api.items',
    'content_api.items_versions',
    'newsroom.news_api.section_filters',
    'newsroom.news_api.products',
    'newsroom.news_api.news.syndicate',
    'newsroom.news_api.formatters',
    'newsroom.news_api.news',
    'newsroom.news_api.news.item.item',
    'newsroom.news_api.news.search',
    'newsroom.news_api.news.feed',
    'newsroom.products',
    'newsroom.news_api.api_audit',
    'newsroom.news_api.news.assets.assets',
    'newsroom.upload',
    'newsroom.history'
]

INSTALLED_APPS = []

#: mongo db name, only used when mongo_uri is not set
MONGO_DBNAME = env('MONGO_DBNAME', 'newsroom')

#: full mongodb connection uri, overrides ``MONGO_DBNAME`` if set
MONGO_URI = env('MONGO_URI', 'mongodb://localhost/%s' % MONGO_DBNAME)

CONTENTAPI_MONGO_DBNAME = 'newsroom'
CONTENTAPI_MONGO_URI = env('CONTENTAPI_MONGO_URI', 'mongodb://localhost/%s' % CONTENTAPI_MONGO_DBNAME)

#: elastic url
ELASTICSEARCH_URL = env('ELASTICSEARCH_URL', 'http://localhost:9200')
CONTENTAPI_ELASTICSEARCH_URL = env('CONTENTAPI_ELASTICSEARCH_URL', ELASTICSEARCH_URL)

#: elastic index name
ELASTICSEARCH_INDEX = env('ELASTICSEARCH_INDEX', 'superdesk')
CONTENTAPI_ELASTICSEARCH_INDEX = env('CONTENTAPI_ELASTICSEARCH_INDEX', CONTENTAPI_MONGO_DBNAME)

FILTER_AGGREGATIONS = False
ELASTIC_DATETIME_FORMAT = '%Y-%m-%dT%H:%M:%S'
