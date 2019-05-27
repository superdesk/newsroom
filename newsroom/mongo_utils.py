
import time
import pymongo
import superdesk
from datetime import timedelta, datetime

from flask import current_app as app
from superdesk.errors import BulkIndexError
from superdesk import config
from superdesk.utc import utcnow


default_page_size = 500


def index_elastic_from_mongo(hours=None, collection=None):
    print('Starting indexing from mongodb for "{}" collection hours={}'.format(collection, hours))

    resources = app.data.get_elastic_resources()
    if collection:
        if collection not in resources:
            raise SystemExit('Cannot find collection: {}'.format(collection))
        resources = [collection]

    for resource in resources:
        print('Starting indexing collection {}'.format(resource))

        for items in _get_mongo_items(resource, hours):
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


def index_elastic_from_mongo_from_timestamp(collection, timestamp_str, direction):
    if not collection:
        raise SystemExit('Collection not provided')
    elif not timestamp_str:
        raise SystemExit('Timestamp not provided')
    elif direction not in ['older', 'newer']:
        raise SystemExit('Direction can only be "older" or "newer", not {}'.format(direction))

    try:
        timestamp = datetime.strptime(timestamp_str, '%Y-%m-%dT%H:%M')
    except ValueError as e:
        raise SystemExit('Timestamp in incorrect format (e.g. 2019-05-20T05:00). {}'.format(e))

    print('Starting indexing from mongodb for "{}" collection, timestamp={}, direction={}'.format(
        collection,
        timestamp,
        direction
    ))

    resources = app.data.get_elastic_resources()
    if collection not in resources:
        raise SystemExit('Cannot find collection: {}'.format(collection))

    print('Starting indexing collection {}'.format(collection))

    for items in _get_mongo_items_from_timestamp(collection, timestamp, direction):
        print('{} Inserting {} items'.format(time.strftime('%X %x %Z'), len(items)))
        s = time.time()

        for i in range(1, 4):
            try:
                success, failed = superdesk.app.data._search_backend(collection).bulk_insert(collection, items)
            except Exception as ex:
                print('Exception thrown on insert to elastic {}', ex)
                time.sleep(10)
                continue
            else:
                break

        print('{} Inserted {} items in {:.3f} seconds'.format(time.strftime('%X %x %Z'), success, time.time() - s))
        if failed:
            print('Failed to do bulk insert of items {}. Errors: {}'.format(len(failed), failed))
            raise BulkIndexError(resource=collection, errors=failed)

    print('Finished indexing collection {}'.format(collection))


def _get_mongo_items(mongo_collection_name, hours=None):
    """Generate list of items from given mongo collection per default page size.

    :param mongo_collection_name: Name of the collection to get the items
    :return: list of items
    """
    print('Indexing data from mongo/{} to elastic/{} for hours={}'.format(mongo_collection_name,
                                                                          mongo_collection_name,
                                                                          hours))

    db = app.data.get_mongo_collection(mongo_collection_name)
    args = {'limit': default_page_size, 'sort': [(config.ID_FIELD, pymongo.ASCENDING)]}
    if hours:
        now = utcnow() - timedelta(hours=float(hours))
        args['filter'] = {'versioncreated': {'$gte': now}}
    else:
        now = utcnow()
        args['filter'] = {}

    last_id = None
    while True:
        if last_id:
            args['filter'].update({config.ID_FIELD: {'$gt': last_id}})
        cursor = db.find(**args)
        if not cursor.count():
            break
        items = list(cursor)
        last_id = items[-1][config.ID_FIELD]
        yield items


def _get_mongo_items_from_timestamp(collection, timestamp, direction):
    """Generate list of items from given mongo collection per default page size.

    :param collection: Name of the collection to get the items
    :param timestamp: Python datetime instance for the timestamp
    :param direction: String indicating which items to retrieve ('older' or 'newer')
    :return: list of items
    """
    print('Indexing data {} than {} from mongo/{} to elastic/{}'.format(
        direction,
        timestamp,
        collection,
        collection
    ))

    db = app.data.get_mongo_collection(collection)

    args = {
        'limit': default_page_size,
        'sort': [('_created', pymongo.ASCENDING)]
    }

    # Filter based on the creation time from the timestamp
    if direction == 'older':
        # Filter out anything created after the provided timestamp
        item_filter = {'_created': {'$lte': timestamp}}
    else:
        # Filter out anything created on or before the provided timestamp
        item_filter = {'_created': {'$gt': timestamp}}

    # Keep the time for the last iteration
    last_created = None

    # Keep the list of processed IDs from last iteration
    last_ids = []
    while True:
        if not last_created:
            args['filter'] = item_filter
        else:
            args['filter'] = {'$and': [
                item_filter,
                {'_created': {'$gte': last_created}}
            ]}

        cursor = db.find(**args)

        # Filter out the items that were processed last iteration
        # As we're filtering based on creation time, there may be an overlap
        # If multiple items were created on the same second
        items = [
            item for item in cursor
            if item.get(config.ID_FIELD) not in last_ids
        ]

        if not len(items):
            break

        # Store the last created time and ids
        last_created = items[-1].get('_created')
        last_ids = [
            item.get(config.ID_FIELD)
            for item in items
        ]

        yield items
