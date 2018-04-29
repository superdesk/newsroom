
import time
import pymongo
import superdesk

from flask import current_app as app
from superdesk.errors import BulkIndexError
from superdesk import config


default_page_size = 500


def index_elastic_from_mongo():
    print('Starting indexing from mongodb for "items" collection')

    resource = 'items'
    for items in _get_mongo_items(resource):
        print('{} Inserting {} items'.format(time.strftime('%X %x %Z'), len(items)))
        s = time.time()

        for i in range(1, 4):
            try:
                success, failed = superdesk.app.data._search_backend(resource).bulk_insert(resource, items)
            except Exception as ex:
                print('Exception thrown on insert to elastic {}', ex)
                time.sleep(10)
                continue
            else:
                break

        print('{} Inserted {} items in {:.3f} seconds'.format(time.strftime('%X %x %Z'), success, time.time() - s))
        if failed:
            print('Failed to do bulk insert of items {}. Errors: {}'.format(len(failed), failed))
            raise BulkIndexError(resource=resource, errors=failed)

    print('Finished indexing collection {}'.format(resource))


def _get_mongo_items(mongo_collection_name):
    """Generate list of items from given mongo collection per default page size.

    :param mongo_collection_name: Name of the collection to get the items
    :return: list of items
    """
    print('Indexing data from mongo/{} to elastic/{}'.format(mongo_collection_name, mongo_collection_name))

    db = app.data.get_mongo_collection(mongo_collection_name)
    args = {'limit': default_page_size, 'sort': [(config.ID_FIELD, pymongo.ASCENDING)]}
    last_id = None
    while True:
        if last_id:
            args.update({'filter': {config.ID_FIELD: {'$gt': last_id}}})
        cursor = db.find(**args)
        if not cursor.count():
            break
        items = list(cursor)
        last_id = items[-1][config.ID_FIELD]
        yield items
