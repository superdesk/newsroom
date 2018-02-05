
import io
import hmac
import flask
import logging
import superdesk

from copy import copy
from PIL import Image, ImageEnhance
from flask import current_app as app
from superdesk.utc import utcnow
from superdesk.text_utils import get_word_count
from newsroom.notifications import push_notification
from newsroom.topics.topics import get_notification_topics
from newsroom.utils import query_resource, parse_dates
from newsroom.email import send_new_item_notification_email, send_history_match_notification_email
from newsroom.history import get_history_users

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


def fix_hrefs(doc):
    if doc.get('renditions'):
        for key, rendition in doc['renditions'].items():
            if rendition.get('media'):
                rendition['href'] = app.upload_url(rendition['media'])
    for assoc in doc.get('associations', {}).values():
        fix_hrefs(assoc)


def publish_item(doc):
    """Duplicating the logic from content_api.publish service."""
    now = utcnow()
    parse_dates(doc)
    doc.setdefault('firstcreated', now)
    doc.setdefault('versioncreated', now)
    doc.setdefault(app.config['VERSION'], 1)
    doc.setdefault('word_count', get_word_count(doc.get('body_html', '')))
    service = superdesk.get_resource_service('content_api')
    if 'evolvedfrom' in doc:
        parent_item = service.find_one(req=None, _id=doc['evolvedfrom'])
        if parent_item:
            doc['ancestors'] = copy(parent_item.get('ancestors', []))
            doc['ancestors'].append(doc['evolvedfrom'])
            doc['bookmarks'] = parent_item.get('bookmarks', [])
        else:
            logger.warning("Failed to find evolvedfrom item %s for %s", doc['evolvedfrom'], doc['guid'])
    fix_hrefs(doc)
    logger.info('publishing %s', doc['guid'])
    for assoc in doc.get('associations', {}).values():
        if assoc:
            assoc.setdefault('subscribers', [])
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
    item['_id'] = publish_item(item)
    notify_new_item(item, check_topics=orig is None)
    return flask.jsonify({})


def notify_new_item(item, check_topics=True):
    if item.get('pubstatus') == 'canceled' or item.get('type') == 'composite':
        return

    lookup = {'is_enabled': True}
    all_users = list(query_resource('users', lookup=lookup, max_results=200))
    user_ids = [u['_id'] for u in all_users]
    users_dict = {str(user['_id']): user for user in all_users}

    all_companies = list(query_resource('companies', lookup=lookup, max_results=200))
    company_ids = [c['_id'] for c in all_companies]
    companies_dict = {str(company['_id']): company for company in all_companies}

    push_notification('new_item', item=item['_id'])

    if check_topics:
        notify_topic_matches(item, users_dict, companies_dict)
    notify_user_matches(item, users_dict, companies_dict, user_ids, company_ids)


def notify_user_matches(item, users_dict, companies_dict, user_ids, company_ids):

    related_items = item.get('ancestors', [])
    related_items.append(item['_id'])

    history_users = get_history_users(related_items, user_ids, company_ids)
    bookmark_users = superdesk.get_resource_service('wire_search'). \
        get_matching_bookmarks(related_items, users_dict, companies_dict)

    history_users.extend(bookmark_users)
    history_users = list(set(history_users))

    if history_users:
        for user in history_users:
            app.data.insert('notifications', [{
                'item': item['_id'],
                'user': user
            }])
        push_notification('history_matches',
                          item=item,
                          users=history_users)
        send_user_notification_emails(item, history_users, users_dict)


def send_user_notification_emails(item, user_matches, users):
    for user_id in user_matches:
        user = users.get(str(user_id))
        if user.get('receive_email'):
            send_history_match_notification_email(user, item=item)


def notify_topic_matches(item, users_dict, companies_dict):
    topics = get_notification_topics()

    topic_matches = superdesk.get_resource_service('wire_search'). \
        get_matching_topics(item['_id'], topics, users_dict, companies_dict)

    if topic_matches:
        push_notification('topic_matches',
                          item=item,
                          topics=topic_matches)
        send_topic_notification_emails(item, topics, topic_matches, users_dict)


def send_topic_notification_emails(item, topics, topic_matches, users):
    for topic in topics:
        user = users.get(str(topic['user']))
        if topic['_id'] in topic_matches and user and user.get('receive_email'):
            send_new_item_notification_email(user, topic['label'], item=item)


# keeping this for testing
@blueprint.route('/notify', methods=['POST'])
def notify():
    data = flask.json.loads(flask.request.get_data())
    notify_new_item(data['item'])
    return flask.jsonify({'status': 'OK'}), 200


@blueprint.route('/push_binary', methods=['POST'])
def push_binary():
    if not test_signature(flask.request):
        flask.abort(500)
    media_id = flask.request.form['media_id']
    media = flask.request.files['media']
    binary = media  # what we store
    content_type = media.content_type

    MIN_WIDTH = 400
    MAX_WIDTH = 2000
    MIN_HEIGHT = 200
    MAX_HEIGHT = 1000

    try:
        if 'image' in media.content_type:
            image = Image.open(media)
            width, height = image.size
            if MIN_WIDTH < width < MAX_WIDTH and MIN_HEIGHT < height < MAX_HEIGHT:
                binary = watermark(image)
                content_type = 'image/jpeg'
    except OSError:
        pass

    app.media.put(binary, resource=ASSETS_RESOURCE, _id=media_id, content_type=content_type)
    return flask.jsonify({'status': 'OK'}), 201


@blueprint.route('/push_binary/<media_id>')
def push_binary_get(media_id):
    if app.media.get(media_id, resource=ASSETS_RESOURCE):
        return flask.jsonify({})
    else:
        flask.abort(404)


def watermark(image):
    if image.mode != 'RGBA':
        image = image.convert('RGBA')

    with app.open_resource('static/watermark.png') as watermark_binary:
        watermark_image = Image.open(watermark_binary)
        set_opacity(watermark_image, 0.3)
        watermark_layer = Image.new('RGBA', image.size)
        watermark_layer.paste(watermark_image, (
            image.size[0] - watermark_image.size[0],
            int((image.size[1] - watermark_image.size[1]) * 0.66),
        ))

    final = Image.alpha_composite(image, watermark_layer)
    output = io.BytesIO()
    final.save(output, 'jpeg', quality=80)
    output.seek(0)
    return output


def set_opacity(image, opacity=1):
    alpha = image.split()[3]
    alpha = ImageEnhance.Brightness(alpha).enhance(opacity)
    image.putalpha(alpha)
