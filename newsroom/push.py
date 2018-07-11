import io
import hmac
import flask
import logging
import superdesk
from datetime import datetime

from copy import copy
from PIL import Image, ImageEnhance
from flask import current_app as app
from flask_babel import gettext

from superdesk.utc import utcnow
from superdesk.text_utils import get_word_count
from newsroom.notifications import push_notification
from newsroom.topics.topics import get_notification_topics
from newsroom.utils import query_resource, parse_dates
from newsroom.email import send_new_item_notification_email, \
    send_history_match_notification_email, send_item_killed_notification_email
from newsroom.history import get_history_users
from newsroom.wire.views import HOME_ITEMS_CACHE_KEY
from newsroom.upload import ASSETS_RESOURCE

from planning.common import WORKFLOW_STATE

logger = logging.getLogger(__name__)
blueprint = flask.Blueprint('push', __name__)

KEY = 'PUSH_KEY'

THUMBNAIL_SIZE = (640, 640)
THUMBNAIL_QUALITY = 80


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


def assert_test_signature(request):
    if not test_signature(request):
        logger.warning('signature invalid on push from %s', request.referrer or request.remote_addr)
        flask.abort(403)


def fix_hrefs(doc):
    if doc.get('renditions'):
        for key, rendition in doc['renditions'].items():
            if rendition.get('media'):
                rendition['href'] = app.upload_url(rendition['media'])
    for assoc in doc.get('associations', {}).values():
        fix_hrefs(assoc)


@blueprint.route('/push', methods=['POST'])
def push():
    assert_test_signature(flask.request)
    item = flask.json.loads(flask.request.get_data())
    assert 'guid' in item, {'guid': 1}
    assert 'type' in item, {'type': 1}

    if item.get('type') == 'event':
        item['_id'] = publish_event(item)
    elif item.get('type') == 'planning':
        publish_planning(item)
    elif item.get('type') == 'text':
        orig = app.data.find_one('wire_search', req=None, _id=item['guid'])
        item['_id'] = publish_item(item)
        notify_new_item(item, check_topics=orig is None)
    else:
        flask.abort(400, gettext('Unknown type {}'.format(item.get('type'))))

    app.cache.delete(HOME_ITEMS_CACHE_KEY)
    return flask.jsonify({})


def set_dates(doc):
    now = utcnow()
    parse_dates(doc)
    doc.setdefault('firstcreated', now)
    doc.setdefault('versioncreated', now)
    doc.setdefault(app.config['VERSION'], 1)


def publish_item(doc):
    """Duplicating the logic from content_api.publish service."""
    set_dates(doc)
    doc.setdefault('wordcount', get_word_count(doc.get('body_html', '')))
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
    if doc.get('associations', {}).get('featuremedia'):
        generate_thumbnails(doc)
    _id = service.create([doc])[0]
    if 'evolvedfrom' in doc and parent_item:
        service.system_update(parent_item['_id'], {'nextversion': _id}, parent_item)
    return _id


def publish_event(event):
    # check if there's an earlier version of event exists
    # if there's an event then _id field will have the same value as event_id
    logger.info('publishing event %s', event)

    try:
        orig = app.data.find_one('agenda', req=None, _id=event['guid'])
        service = superdesk.get_resource_service('agenda')

        if not orig:
            # new event
            agenda = {}
            set_agenda_metadata_from_event(agenda, event)
            agenda['dates'] = get_event_dates(event)
            _id = service.create([agenda])[0]
        else:
            # replace the original document
            if event.get('state') in [WORKFLOW_STATE.CANCELLED, WORKFLOW_STATE.KILLED] or \
                    event.get('pubstatus') == 'cancelled':

                # it has been cancelled so don't need to change the dates
                # update the event, the version and the state
                updates = {
                    'event': event,
                    app.config['VERSION']: event[app.config['VERSION']],
                    'state': event['state']
                }

                _id = service.patch(event['guid'], updates)

            elif event.get('state') in [WORKFLOW_STATE.RESCHEDULED, WORKFLOW_STATE.POSTPONED]:
                # schedule is changed, recalculate the dates, planning id and coverages from dates will be removed
                updates = {}
                set_agenda_metadata_from_event(updates, event)
                updates['dates'] = get_event_dates(event)
                updates['coverages'] = None
                updates['planning_items'] = None
                _id = service.patch(event['guid'], updates)

            elif event.get('state') == WORKFLOW_STATE.SCHEDULED:
                # event is reposted (possibly after a cancel)
                updates = {
                    'event': event,
                    app.config['VERSION']: event[app.config['VERSION']],
                    'state': event['state'],
                    'dates': get_event_dates(event),
                }
                set_agenda_metadata_from_event(updates, event)
                _id = service.patch(event['guid'], updates)

        return _id
    except Exception as exc:
        logger.error('Error in publishing event: {}'.format(event), exc, exc_info=True)


def get_event_dates(event):
    event['dates']['start'] = datetime.strptime(event['dates']['start'], '%Y-%m-%dT%H:%M:%S+0000')
    event['dates']['end'] = datetime.strptime(event['dates']['end'], '%Y-%m-%dT%H:%M:%S+0000')

    dates = {
        'start': event['dates']['start'],
        'end': event['dates']['end'],
        'tz': event['dates']['tz'],
    }

    return dates


def publish_planning(planning):
    logger.info('publishing planning %s', planning)
    service = superdesk.get_resource_service('agenda')

    try:
        # update dates
        planning['planning_date'] = datetime.strptime(planning['planning_date'], '%Y-%m-%dT%H:%M:%S+0000')

        if planning.get('event_item'):
            # this is a planning for an event item
            # if there's an event then _id field will have the same value as event_id
            agenda = app.data.find_one('agenda', req=None, _id=planning['event_item'])

            if not agenda:
                # event id exists in planning item but event is not in the system
                logger.warning('Event {} for planning {} couldn\'t be found'.format(planning['event_item'], planning))
                # create new agenda
                agenda = init_adhoc_agenda(planning)
            else:
                if planning.get('state') in [WORKFLOW_STATE.CANCELLED, WORKFLOW_STATE.KILLED] or \
                        planning.get('pubstatus') == 'cancelled':
                    # remove the planning item from the list
                    set_agenda_planning_items(agenda, planning, action='remove')

                    return service.patch(agenda['_id'], agenda)

        else:
            # there's no event item (ad-hoc planning item)
            agenda = init_adhoc_agenda(planning)

        # update agenda metadata
        set_agenda_metadata_from_planning(agenda, planning)

        # add the planning item to the list
        set_agenda_planning_items(agenda, planning, action='add')

        if not agenda.get('_id'):
            # setting _id of agenda to be equal to planning if there's no event id
            agenda.setdefault('_id', planning.get('event_item', planning['guid']) or planning['guid'])
            _id = service.create([agenda])[0]
        else:
            # replace the original document
            _id = service.patch(agenda['_id'], agenda)
        return _id
    except Exception as exc:
        logger.error('Error in publishing planning: {}'.format(planning), exc, exc_info=True)


def init_adhoc_agenda(planning):
    """
    Inits an adhoc agenda item
    """
    agenda = {}

    # check if there's an existing ad-hoc
    existing_planning_items = list(query_resource('agenda', lookup={'planning_id': planning['guid']}))

    if len(existing_planning_items) > 0:
        agenda = existing_planning_items[0]

    # planning dates is saved as the dates of the new agenda
    agenda['dates'] = {
        'start': planning['planning_date'],
        'end': planning['planning_date'],
    }

    return agenda


def set_agenda_metadata_from_event(agenda, event):
    """
    Sets agenda metadata from a given event
    """
    parse_dates(event)

    # setting _id of agenda to be equal to event
    agenda.setdefault('_id', event['guid'])

    agenda['event_id'] = event['guid']
    agenda['recurrence_id'] = event.get('recurrence_id')
    agenda['name'] = event.get('name')
    agenda['slugline'] = event.get('slugline', agenda.get('slugline'))
    agenda['definition_long'] = event.get('definition_long')
    agenda['calendars'] = event.get('calendars')
    agenda['location'] = event.get('location')
    agenda['ednote'] = event.get('ednote', agenda.get('ednote'))
    agenda['state'] = event.get('state')
    agenda['place'] = event.get('place')
    agenda['subject'] = event.get('subject')
    agenda['anpa_category'] = event.get('anpa_category')
    agenda['products'] = event.get('products')

    agenda['event'] = event

    set_dates(agenda)


def set_agenda_metadata_from_planning(agenda, planning_item):
    """
    Sets agenda metadata from a given planning
    """
    parse_dates(planning_item)
    set_dates(agenda)

    agenda['headline'] = planning_item.get('headline')
    agenda['slugline'] = planning_item.get('slugline', agenda.get('slugline'))
    agenda['abstract'] = planning_item.get('abstract')
    agenda['ednote'] = planning_item.get('ednote', agenda.get('ednote'))
    agenda['name'] = planning_item.get('name')
    agenda['place'] = planning_item.get('place', agenda.get('place'))
    agenda['subject'] = planning_item.get('subject', agenda.get('subject'))
    agenda['anpa_category'] = planning_item.get('anpa_category', agenda.get('anpa_category'))
    agenda['genre'] = planning_item.get('genre')
    agenda['priority'] = planning_item.get('priority')
    agenda['urgency'] = planning_item.get('urgency')
    agenda['products'] = planning_item.get('products')


def set_agenda_planning_items(agenda, planning_item, action='add'):
    """
    Updates the list of planning items of agenda. If action is 'add' then adds the new one.
    And updates the list of coverages
    """
    existing_planning_items = agenda.get('planning_items', [])
    agenda['planning_items'] = [p for p in existing_planning_items if p['guid'] != planning_item['guid']] or []

    if action == 'add':
        agenda['planning_items'].append(planning_item)

    agenda['coverages'] = get_coverages(agenda['planning_items'])


def get_coverages(planning_items):
    """
    Returns list of coverages for given planning items
    """
    coverages = []
    for planning_item in planning_items:
        for coverage in planning_item.get('coverages', []):
            coverages.append({
                'planning_id': planning_item['guid'],
                'coverage_id': coverage['coverage_id'],
                'scheduled': coverage['planning']['scheduled'],
                'coverage_type': coverage['planning']['g2_content_type'],
                'workflow_status': coverage['workflow_status'],
                'news_coverage_status': coverage.get('news_coverage_status', {}).get('label'),
                'coverage_provider': coverage['planning'].get('coverage_provider'),
            })

    return coverages


def notify_new_item(item, check_topics=True):
    if item.get('type') == 'composite':
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
        if item.get('pubstatus') == 'canceled':
            send_item_killed_notification_email(user, item=item)
        else:
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
    assert_test_signature(flask.request)
    media = flask.request.files['media']
    media_id = flask.request.form['media_id']
    app.media.put(media, resource=ASSETS_RESOURCE, _id=media_id, content_type=media.content_type)
    return flask.jsonify({'status': 'OK'}), 201


@blueprint.route('/push_binary/<media_id>')
def push_binary_get(media_id):
    if app.media.get(media_id, resource=ASSETS_RESOURCE):
        return flask.jsonify({})
    else:
        flask.abort(404)


def generate_thumbnails(item):
    picture = item.get('associations', {}).get('featuremedia', {})
    if not picture:
        return

    # use 4-3 rendition for generated thumbs
    renditions = picture.get('renditions', {})
    rendition = renditions.get('4-3', renditions.get('viewImage'))
    if not rendition:
        return

    # generate thumbnails
    binary = app.media.get(rendition['media'], resource=ASSETS_RESOURCE)
    im = Image.open(binary)
    thumbnail = _get_thumbnail(im)  # 4-3 rendition resized
    watermark = _get_watermark(im)  # 4-3 rendition with watermark
    picture['renditions'].update({
        '_newsroom_thumbnail': _store_image(thumbnail,
                                            _id='%s%s' % (rendition['media'], '_newsroom_thumbnail')),
        '_newsroom_thumbnail_large': _store_image(watermark,
                                                  _id='%s%s' % (rendition['media'], '_newsroom_thumbnail_large')),
    })
    # add watermark to base/view images
    for key in ['base', 'view']:
        rendition = picture.get('renditions', {}).get('%sImage' % key)
        if rendition:
            binary = app.media.get(rendition['media'], resource=ASSETS_RESOURCE)
            im = Image.open(binary)
            watermark = _get_watermark(im)
            picture['renditions'].update({
                '_newsroom_%s' % key: _store_image(watermark,
                                                   _id='%s%s' % (rendition['media'], '_newsroom_%s' % key))
            })


def _store_image(image, filename=None, _id=None):
    binary = io.BytesIO()
    image.save(binary, 'jpeg', quality=THUMBNAIL_QUALITY)
    binary.seek(0)
    media_id = app.media.put(binary, filename=filename, _id=_id, resource=ASSETS_RESOURCE, content_type='image/jpeg')
    if not media_id:
        # media with the same id exists
        media_id = _id
    binary.seek(0)
    return {
        'media': str(media_id),
        'href': app.upload_url(media_id),
        'width': image.width,
        'height': image.height,
        'mimetype': 'image/jpeg'
    }


def _get_thumbnail(image):
    image = image.copy()
    image.thumbnail(THUMBNAIL_SIZE)
    return image


def _get_watermark(image):
    image = image.copy()
    if not app.config.get('WATERMARK_IMAGE'):
        return image
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    with open(app.config['WATERMARK_IMAGE'], mode='rb') as watermark_binary:
        watermark_image = Image.open(watermark_binary)
        set_opacity(watermark_image, 0.3)
        watermark_layer = Image.new('RGBA', image.size)
        watermark_layer.paste(watermark_image, (
            image.size[0] - watermark_image.size[0],
            int((image.size[1] - watermark_image.size[1]) * 0.66),
        ))

    watermark = Image.alpha_composite(image, watermark_layer)
    return watermark.convert('RGB')


def set_opacity(image, opacity=1):
    alpha = image.split()[3]
    alpha = ImageEnhance.Brightness(alpha).enhance(opacity)
    image.putalpha(alpha)
