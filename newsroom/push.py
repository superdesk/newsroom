import io
import hmac
import flask
import logging
import superdesk
from datetime import datetime

from copy import copy, deepcopy
from PIL import Image, ImageEnhance
from flask import current_app as app, url_for
from flask_babel import gettext
from eve_elastic.elastic import parse_date

from superdesk.utc import utcnow
from superdesk.text_utils import get_word_count
from newsroom.notifications import push_notification
from newsroom.topics.topics import get_wire_notification_topics, get_agenda_notification_topics
from newsroom.utils import parse_dates, get_user_dict, get_company_dict
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
    assert 'guid' in item or '_id' in item, {'guid': 1}
    assert 'type' in item, {'type': 1}

    if item.get('type') == 'event':
        orig = app.data.find_one('agenda', req=None, _id=item['guid'])
        id = publish_event(item, orig)
        agenda = app.data.find_one('agenda', req=None, _id=id)
        notify_new_item(agenda, check_topics=True)
    elif item.get('type') == 'planning':
        published = publish_planning(item)
        agenda = app.data.find_one('agenda', req=None, _id=published['_id'])
        notify_new_item(agenda, check_topics=True)
    elif item.get('type') == 'text':
        orig = app.data.find_one('wire_search', req=None, _id=item['guid'])
        item['_id'] = publish_item(item)
        notify_new_item(item, check_topics=orig is None)
    elif item['type'] == 'planning_featured':
        publish_planning_featured(item)
    else:
        flask.abort(400, gettext('Unknown type {}'.format(item.get('type'))))

    app.cache.delete(HOME_ITEMS_CACHE_KEY)
    return flask.jsonify({})


def set_dates(doc):
    now = utcnow()
    parse_dates(doc)
    doc.setdefault('firstcreated', now)
    doc.setdefault('versioncreated', now)
    doc.setdefault('version', 1)
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
            doc['planning_id'] = parent_item.get('planning_id')
            doc['coverage_id'] = parent_item.get('coverage_id')
        else:
            logger.warning("Failed to find evolvedfrom item %s for %s", doc['evolvedfrom'], doc['guid'])
    fix_hrefs(doc)
    logger.debug('publishing %s', doc['guid'])
    for assoc in doc.get('associations', {}).values():
        if assoc:
            assoc.setdefault('subscribers', [])
    if doc.get('associations', {}).get('featuremedia'):
        generate_thumbnails(doc)
    if doc.get('coverage_id'):
        superdesk.get_resource_service('agenda').set_delivery(doc)
    _id = service.create([doc])[0]
    if 'evolvedfrom' in doc and parent_item:
        service.system_update(parent_item['_id'], {'nextversion': _id}, parent_item)
    return _id


def publish_event(event, orig):
    logger.debug('publishing event %s', event)

    # populate attachments href
    if event.get('files'):
        for file_ref in event['files']:
            if file_ref.get('media'):
                file_ref.setdefault('href', app.upload_url(file_ref['media']))

    _id = event['guid']
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
                'version': event.get('version', event.get(app.config['VERSION'])),
                'state': event['state']
            }

            service.patch(event['guid'], updates)
            superdesk.get_resource_service('agenda').notify_agenda_update('event_unposted', orig)

        elif event.get('state') in [WORKFLOW_STATE.RESCHEDULED, WORKFLOW_STATE.POSTPONED]:
            # schedule is changed, recalculate the dates, planning id and coverages from dates will be removed
            updates = {}
            set_agenda_metadata_from_event(updates, event)
            updates['dates'] = get_event_dates(event)
            updates['coverages'] = None
            updates['planning_items'] = None
            service.patch(event['guid'], updates)
            superdesk.get_resource_service('agenda').notify_agenda_update('event_updated', orig)

        elif event.get('state') == WORKFLOW_STATE.SCHEDULED:
            # event is reposted (possibly after a cancel)
            updates = {
                'event': event,
                'version': event.get('version', event.get(app.config['VERSION'])),
                'state': event['state'],
                'dates': get_event_dates(event),
            }
            set_agenda_metadata_from_event(updates, event)
            service.patch(event['guid'], updates)
            superdesk.get_resource_service('agenda').notify_agenda_update('event_updated', orig)

    return _id


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
    logger.debug('publishing planning %s', planning)
    service = superdesk.get_resource_service('agenda')
    agenda = None

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

                service.patch(agenda['_id'], agenda)
                return agenda

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
        agenda.setdefault('guid', planning.get('event_item', planning['guid']) or planning['guid'])
        service.create([agenda])[0]
    else:
        # replace the original document
        service.patch(agenda['_id'], agenda)
    return agenda


def init_adhoc_agenda(planning):
    """
    Inits an adhoc agenda item
    """

    # check if there's an existing ad-hoc
    agenda = app.data.find_one('agenda', req=None, _id=planning['guid']) or {}

    # planning dates is saved as the dates of the new agenda
    agenda['dates'] = {
        'start': planning['planning_date'],
        'end': planning['planning_date'],
    }

    agenda['state'] = planning['state']

    return agenda


def set_agenda_metadata_from_event(agenda, event):
    """
    Sets agenda metadata from a given event
    """
    parse_dates(event)

    # setting _id of agenda to be equal to event
    agenda.setdefault('_id', event['guid'])

    agenda['guid'] = event['guid']
    agenda['event_id'] = event['guid']
    agenda['recurrence_id'] = event.get('recurrence_id')
    agenda['name'] = event.get('name')
    agenda['slugline'] = event.get('slugline', agenda.get('slugline'))
    agenda['definition_short'] = event.get('definition_short')
    agenda['definition_long'] = event.get('definition_long')
    agenda['version'] = event.get('version')
    agenda['calendars'] = event.get('calendars')
    agenda['location'] = event.get('location')
    agenda['ednote'] = event.get('ednote', agenda.get('ednote'))
    agenda['state'] = event.get('state')
    agenda['place'] = event.get('place')
    agenda['subject'] = event.get('subject')
    agenda['products'] = event.get('products')

    # only set service if available
    service = format_qcode_items(event.get('anpa_category'))
    if service:
        agenda['service'] = service

    agenda['event'] = event

    set_dates(agenda)


def format_qcode_items(items=None):
    try:
        return [{'code': item.get('qcode'), 'name': item.get('name')} for item in items]
    except (TypeError, AttributeError):
        return []


def set_agenda_metadata_from_planning(agenda, planning_item):
    """Sets agenda metadata from a given planning.

    Event data has priority, so don't override it, only add  planning if it's missing.
    """
    event = agenda.get('event', {})
    parse_dates(planning_item)
    set_dates(agenda)

    def get(key):
        return event.get(key) or planning_item.get(key) or agenda.get(key)

    agenda['name'] = get('name')
    agenda['headline'] = get('headline')
    agenda['slugline'] = get('slugline')
    agenda['abstract'] = get('abstract')
    agenda['ednote'] = get('ednote')
    agenda['place'] = get('place')
    agenda['subject'] = get('subject')
    agenda['products'] = get('products')
    agenda['genre'] = planning_item.get('genre') or agenda.get('genre')
    agenda['priority'] = planning_item.get('priority') or agenda.get('priority')
    agenda['urgency'] = planning_item.get('urgency') or agenda.get('urgency')
    agenda['definition_short'] = event.get('definition_short') \
        or planning_item.get('description_text') \
        or agenda.get('definition_short')
    agenda['definition_long'] = event.get('definition_long') \
        or planning_item.get('abstract') \
        or agenda.get('definition_long')

    service = unique_codes(
        format_qcode_items(planning_item.get('anpa_category')),
        format_qcode_items(event.get('anpa_category')),
        format_qcode_items(agenda.get('service'))
    )

    if service:
        agenda['service'] = service


def set_agenda_planning_items(agenda, planning_item, action='add'):
    """
    Updates the list of planning items of agenda. If action is 'add' then adds the new one.
    And updates the list of coverages
    """
    existing_planning_items = deepcopy(agenda.get('planning_items', []))
    agenda['planning_items'] = [p for p in existing_planning_items if p['guid'] != planning_item['guid']] or []

    if action == 'add':
        if len(existing_planning_items) == len(agenda['planning_items']):
            # planning item is newly added
            superdesk.get_resource_service('agenda').notify_agenda_update('planning_added', agenda)

        agenda['planning_items'].append(planning_item)

    if action == 'remove':
        superdesk.get_resource_service('agenda').notify_agenda_update('planning_cancelled', agenda)

    agenda['coverages'], coverage_changes = get_coverages(agenda['planning_items'], agenda.get('coverages', []))

    if coverage_changes.get('coverage_added'):
        superdesk.get_resource_service('agenda').notify_agenda_update('coverage_added', agenda)

    agenda['display_dates'] = get_display_dates(agenda['dates'], agenda['planning_items'])


def get_display_dates(agenda_date, planning_items):
    """
    Returns the list of dates where a planning item or a coverage falls outside
    of the agenda item dates
    """
    display_dates = []

    def parse_display_dates(date):
        if type(date) == datetime:
            return date
        if date and type(date) == str:
            return parse_date(date)

    def should_add(date):
        try:
            return not (agenda_date['start'].date() <= date.date() <= agenda_date['end'].date()) and \
                   not date.date() in [d['date'].date() for d in display_dates]
        except (AttributeError, TypeError):
            return False

    for planning_item in planning_items:
        if not planning_item.get('coverages'):
            parsed_date = parse_display_dates(planning_item['planning_date'])
            if should_add(parsed_date):
                display_dates.append({
                    'date': parsed_date
                })

        for coverage in planning_item.get('coverages', []):
            parsed_date = parse_display_dates(coverage['planning']['scheduled'])
            if should_add(parsed_date):
                display_dates.append({
                    'date': parsed_date
                })

    return display_dates


def get_coverages(planning_items, original_coverages=[]):
    """
    Returns list of coverages for given planning items
    """

    def get_existing_coverage(id):
        return next((o for o in original_coverages if o['coverage_id'] == id), {})

    def set_text_delivery(coverage, deliveries):
        if coverage['coverage_type'] == 'text' and deliveries:
            coverage['delivery_id'] = deliveries[0]['item_id']
            coverage['delivery_href'] = url_for('wire.item', _id=deliveries[0]['item_id'])

    coverages = []
    coverage_changes = {}
    for planning_item in planning_items:
        for coverage in planning_item.get('coverages', []):
            existing_coverage = get_existing_coverage(coverage['coverage_id'])
            new_coverage = {
                'planning_id': planning_item['guid'],
                'coverage_id': coverage['coverage_id'],
                'scheduled': coverage['planning']['scheduled'],
                'coverage_type': coverage['planning']['g2_content_type'],
                'workflow_status': coverage['workflow_status'],
                'coverage_status': coverage.get('news_coverage_status', {}).get('label'),
                'coverage_provider': coverage['planning'].get('coverage_provider'),
                'delivery_id': existing_coverage.get('delivery_id')
            }

            new_coverage['delivery_href'] = app.set_photo_coverage_href(coverage, planning_item) \
                or existing_coverage.get('delivery_href')
            set_text_delivery(new_coverage, coverage.get('deliveries'))
            coverages.append(new_coverage)

            if original_coverages and not existing_coverage:
                coverage_changes['coverage_added'] = True

    return coverages, coverage_changes


def notify_new_item(item, check_topics=True):
    if not item or item.get('type') == 'composite':
        return

    user_dict = get_user_dict()
    user_ids = [u['_id'] for u in user_dict.values()]

    company_dict = get_company_dict()
    company_ids = [c['_id'] for c in company_dict.values()]

    push_notification('new_item', _items=[item])

    if check_topics:
        if item.get('type') == 'text':
            notify_wire_topic_matches(item, user_dict, company_dict)
        else:
            notify_agenda_topic_matches(item, user_dict)

    notify_user_matches(item, user_dict, company_dict, user_ids, company_ids)


def notify_user_matches(item, users_dict, companies_dict, user_ids, company_ids):
    related_items = item.get('ancestors', [])
    related_items.append(item['_id'])

    history_users = get_history_users(related_items, user_ids, company_ids)

    bookmark_users = []
    if item.get('type') == 'text':
        bookmark_users = superdesk.get_resource_service('wire_search').\
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
        if item.get('pubstatus', item.get('state')) in ['canceled', 'cancelled']:
            send_item_killed_notification_email(user, item=item)
        else:
            if user.get('receive_email'):
                send_history_match_notification_email(user, item=item)


def notify_wire_topic_matches(item, users_dict, companies_dict):
    topics = get_wire_notification_topics()

    topic_matches = superdesk.get_resource_service('wire_search'). \
        get_matching_topics(item['_id'], topics, users_dict, companies_dict)

    if topic_matches:
        push_notification('topic_matches',
                          item=item,
                          topics=topic_matches)
        send_topic_notification_emails(item, topics, topic_matches, users_dict)


def notify_agenda_topic_matches(item, users_dict):
    topics = get_agenda_notification_topics(item, users_dict)

    topic_matches = [t['_id'] for t in topics]

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


def unique_codes(*groups):
    """Get unique items from all lists using code."""
    codes = set()
    items = []
    for group in groups:
        for item in group:
            if item.get('code') and item['code'] not in codes:
                codes.add(item['code'])
                items.append(item)
    return items


def publish_planning_featured(item):
    assert item.get('_id'), {'_id': 1}
    assert item.get('tz'), {'tz': 1}
    assert item.get('items'), {'items': 1}
    service = superdesk.get_resource_service('agenda_featured')
    orig = service.find_one(req=None, _id=item['_id'])
    if orig:
        service.update(orig['_id'], {'items': item['items']}, orig)
    else:
        service.create([item])
