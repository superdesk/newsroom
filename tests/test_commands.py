from flask import json
from time import sleep
from datetime import datetime, timedelta
from eve.utils import ParsedRequest

from newsroom.mongo_utils import index_elastic_from_mongo, index_elastic_from_mongo_from_timestamp

from .fixtures import items, init_items, init_auth, init_company  # noqa


def remove_elastic_index(app):
    # remove the elastic index
    indices = '%s*' % app.config['CONTENTAPI_ELASTICSEARCH_INDEX']
    es = app.data.elastic.es
    es.indices.delete(indices, ignore=[404])


def test_item_detail(app, client):
    remove_elastic_index(app)
    app.data.init_elastic(app)
    sleep(1)
    index_elastic_from_mongo()
    sleep(1)

    resp = client.get('/wire/tag:foo')
    assert resp.status_code == 200
    html = resp.get_data().decode('utf-8')
    assert 'Amazon Is Opening More Bookstores' in html

    resp = client.get('/wire/%s/versions' % items[1]['_id'])
    data = json.loads(resp.get_data())
    assert 2 == len(data['_items'])
    assert 'tag:weather' == data['_items'][0]['_id']

    resp = client.get('/wire/search')
    assert resp.status_code == 200
    data = json.loads(resp.get_data())
    assert 3 == len(data['_items'])


def test_index_from_mongo_hours_from(app, client):
    remove_elastic_index(app)
    app.data.init_elastic(app)
    sleep(1)
    index_elastic_from_mongo(hours=24)
    sleep(1)

    resp = client.get('/wire/tag:foo')
    assert resp.status_code == 200
    html = resp.get_data().decode('utf-8')
    assert 'Amazon Is Opening More Bookstores' in html

    resp = client.get('/wire/search')
    assert resp.status_code == 200
    data = json.loads(resp.get_data())
    assert 1 == len(data['_items'])


def test_index_from_mongo_collection(app, client):
    remove_elastic_index(app)
    app.data.init_elastic(app)
    sleep(1)
    index_elastic_from_mongo(collection='items')
    sleep(1)

    resp = client.get('/wire/tag:foo')
    assert resp.status_code == 200
    html = resp.get_data().decode('utf-8')
    assert 'Amazon Is Opening More Bookstores' in html

    resp = client.get('/wire/search')
    assert resp.status_code == 200
    data = json.loads(resp.get_data())
    assert 3 == len(data['_items'])


def test_index_from_mongo_from_timestamp(app, client):
    app.data.remove('items')
    sorted_items = [{
        '_id': 'tag:foo-1',
        '_created': datetime.now() - timedelta(hours=5),

    }, {
        '_id': 'urn:bar-1',
        '_created': datetime.now() - timedelta(hours=5)
    }, {
        '_id': 'tag:foo-2',
        '_created': datetime.now() - timedelta(hours=4)
    }, {
        '_id': 'urn:bar-2',
        '_created': datetime.now() - timedelta(hours=4)
    }, {
        '_id': 'tag:foo-3',
        '_created': datetime.now() - timedelta(hours=3)
    }, {
        '_id': 'urn:bar-3',
        '_created': datetime.now() - timedelta(hours=3)
    }]

    app.data.insert('items', sorted_items)
    remove_elastic_index(app)
    app.data.init_elastic(app)
    sleep(1)
    assert 0 == app.data.elastic.find('items', ParsedRequest(), {}).count()

    timestamp = (datetime.now() - timedelta(hours=3, minutes=30)).strftime('%Y-%m-%dT%H:%M')
    index_elastic_from_mongo_from_timestamp('items', timestamp, 'older')
    sleep(1)
    assert 4 == app.data.elastic.find('items', ParsedRequest(), {}).count()

    index_elastic_from_mongo_from_timestamp('items', timestamp, 'newer')
    sleep(1)
    assert 6 == app.data.elastic.find('items', ParsedRequest(), {}).count()
