from flask import json
from time import sleep
from newsroom.mongo_utils import index_elastic_from_mongo

from .fixtures import items, init_items, init_auth, init_company  # noqa


def remove_elastic_index(app):
    # remove the elastic index
    indices = '%s*' % app.config['CONTENTAPI_ELASTICSEARCH_INDEX']
    es = app.data.elastic.es
    es.indices.delete(indices, ignore=[404])


def test_item_detail(app, client):
    remove_elastic_index(app)
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
