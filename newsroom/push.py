
import hmac
import flask
import logging
import superdesk

from copy import copy
from flask import current_app as app
from superdesk.utc import utcnow
from newsroom.notification import push_notification

logger = logging.getLogger(__name__)
blueprint = flask.Blueprint('push', __name__)


ASSETS_RESOURCE = 'upload'
KEY = 'PUSH_KEY'


def test_signature(request):
    """Test if request is signed using app PUSH_KEY."""
    if not app.config.get(KEY):
        logger.warning('PUSH_KEY is not configured, can not verify incoming data.')
        return True
    payload = request.get_data()
    key = app.config[KEY]
    mac = hmac.new(key, payload, 'sha1')
    return hmac.compare_digest(
        request.headers.get('x-superdesk-signature', ''),
        'sha1=%s' % mac.hexdigest()
    )


def publish_item(doc):
    """Duplicating the logic from content_api.publish service."""
    now = utcnow()
    doc.setdefault('firstcreated', now)
    doc.setdefault('versioncreated', now)
    doc.setdefault(app.config['VERSION'], 1)
    service = superdesk.get_resource_service('content_api')
    if 'evolvedfrom' in doc:
        parent_item = service.find_one(req=None, _id=doc['evolvedfrom'])
        if parent_item:
            doc['ancestors'] = copy(parent_item.get('ancestors', []))
            doc['ancestors'].append(doc['evolvedfrom'])
            doc['bookmarks'] = parent_item.get('bookmarks', [])
        else:
            logger.warning("Failed to find evolvedfrom item %s for %s", doc['evolvedfrom'], doc['guid'])
    if doc.get('renditions'):
        for key, rendition in doc['renditions'].items():
            if rendition.get('media'):
                rendition['href'] = app.upload_url(rendition['media'])
    logger.info('publishing %s', doc['guid'])
    _id = service.create([doc])[0]
    if 'evolvedfrom' in doc and parent_item:
        service.system_update(parent_item['_id'], {'nextversion': _id}, parent_item)
    return _id


@blueprint.route('/push', methods=['POST'])
def push():
    if not test_signature(flask.request):
        flask.abort(500)
    item = flask.json.loads(flask.request.get_data())
    assert 'guid' in item, {'guid': 1}
    assert 'type' in item, {'type': 1}
    orig = app.data.find_one('wire_search', req=None, _id=item['guid'])
    if not orig:
        publish_item(item)
    push_notification('update', item=item['guid'])
    return flask.jsonify({})


@blueprint.route('/push_binary', methods=['POST'])
def push_binary():
    if not test_signature(flask.request):
        flask.abort(500)
    media_id = flask.request.form['media_id']
    media = flask.request.files['media']
    app.media.put(media, resource=ASSETS_RESOURCE, _id=media_id)
    return flask.jsonify({'status': 'OK'}), 201


@blueprint.route('/push_binary/<media_id>')
def push_binary_get(media_id):
    if app.media.get(media_id, resource=ASSETS_RESOURCE):
        return flask.jsonify({})
    else:
        flask.abort(404)
