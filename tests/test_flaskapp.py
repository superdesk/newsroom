
import bson
from flask.json import dumps


def test_json_encoder_handles_objectid(app):
    _id = bson.ObjectId()
    with app.app_context():
        json = dumps({'_id': _id})
    assert str(_id) in json


def test_upload_mongo_prefix(app):
    assert 'CONTENTAPI_MONGO' == app.data.mongo.current_mongo_prefix('upload')
