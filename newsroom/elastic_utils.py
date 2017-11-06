"""
Copy of superdesk.commands.rebuild_elastic_index
"""

import elasticsearch

from flask import current_app as app
from eve_elastic import get_es, get_indices, reindex
from superdesk.utils import get_random_string


def rebuild_elastic_index():
    index_name = app.config['CONTENTAPI_ELASTICSEARCH_INDEX']
    print('Starting index rebuilding for index: {}'.format(index_name))
    try:
        es = get_es(app.config['CONTENTAPI_ELASTICSEARCH_URL'])
        clone_name = index_name + '-' + get_random_string()
        print('Creating index: ', clone_name)
        app.data.elastic.create_index(clone_name, app.config['ELASTICSEARCH_SETTINGS'])
        real_name = app.data.elastic.get_index_by_alias(clone_name)
        print('Putting mapping for index: ', clone_name)
        app.data.elastic.put_mapping(app, clone_name)
        print('Starting index rebuilding.')
        reindex(es, index_name, clone_name)
        print('Finished index rebuilding.')
        print('Deleting index: ', index_name)
        get_indices(es).delete(index_name)
        print('Creating alias: ', index_name)
        get_indices(es).put_alias(index=real_name, name=index_name)
        print('Alias created.')
        print('Deleting clone name alias')
        get_indices(es).delete_alias(name=clone_name, index=real_name)
        print('Deleted clone name alias')
    except elasticsearch.exceptions.NotFoundError as nfe:
        print(nfe)
    print('Index {0} rebuilt successfully.'.format(index_name))
