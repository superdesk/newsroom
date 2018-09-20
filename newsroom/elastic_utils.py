"""
Copy of superdesk.commands.rebuild_elastic_index
"""

import elasticsearch

from flask import current_app as app
from eve_elastic import get_es, get_indices, reindex


def rebuild_elastic_index():
    index_name = app.config['CONTENTAPI_ELASTICSEARCH_INDEX']
    try:
        es = get_es(app.config['CONTENTAPI_ELASTICSEARCH_URL'])
        print('rebuilding index', index_name)

        # remove alias from current index
        old_index = app.data.elastic.get_index_by_alias(index_name)
        print('removing old index alias', old_index)
        get_indices(es).delete_alias(name=index_name, index=old_index)

        # create new index
        print('creating new index')
        app.data.elastic.create_index(index_name, app.config['ELASTICSEARCH_SETTINGS'])
        new_index = app.data.elastic.get_index_by_alias(index_name)

        print('putting mapping to index', new_index)
        app.data.elastic.put_mapping(app, new_index)

        try:
            print('starting index rebuilding')
            reindex(es, old_index, new_index)
            print('finished index rebuilding.')
            print('deleting old index', old_index)
            get_indices(es).delete(old_index)
        except elasticsearch.helpers.BulkIndexError as err:
            print('reindex error', err)
            print('keeping old index', old_index)

        print('index rebuilt done successfully', index_name)
    except elasticsearch.exceptions.NotFoundError as nfe:
        print(nfe)
