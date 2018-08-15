import io
import flask
import zipfile
import superdesk
import urllib.request
import json

from bson import ObjectId
from operator import itemgetter
from flask import current_app as app
from eve.render import send_response
from eve.methods.get import get_internal
from werkzeug.utils import secure_filename
from flask_babel import gettext
from superdesk.utc import utcnow

from newsroom.navigations.navigations import get_navigations_by_company
from newsroom.products.products import get_products_by_company
from newsroom.wire import blueprint
from newsroom.auth import get_user, get_user_id, login_required
from newsroom.topics import get_user_topics
from newsroom.email import send_email
from newsroom.companies import get_user_company
from newsroom.utils import get_entity_or_404, get_json_or_400, parse_dates
from newsroom.notifications import push_user_notification
from .search import get_bookmarks_count

HOME_ITEMS_CACHE_KEY = 'home_items'


def get_services(user):
    services = app.config['SERVICES']
    for service in services:
        service.setdefault('is_active', True)
    company = get_user_company(user)
    if company and company.get('services'):
        for service in services:
            service['is_active'] = bool(company['services'].get(service['code']))
    return services


def get_view_data():
    user = get_user()
    return {
        'user': str(user['_id']) if user else None,
        'company': str(user['company']) if user and user.get('company') else None,
        'topics': get_user_topics(user['_id']) if user else [],
        'formats': [{'format': f['format'], 'name': f['name']} for f in app.download_formatters.values()],
        'navigations': get_navigations_by_company(str(user['company']) if user and user.get('company') else None),
    }


def _fetch_photos(url, count):
    headers = {'Authorization': 'Basic {}'.format(app.config.get('AAPPHOTOS_TOKEN'))}
    request = urllib.request.Request(url, headers=headers)

    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            data = response.read()
            json_data = json.loads(data.decode("utf-8"))
            return json_data['GalleryContainers'][:count]
    except Exception:
        return []


def get_photos():
    if app.cache.get('home_photos'):
        return app.cache.get('home_photos')

    photos = []
    for item in app.config.get('HOMEPAGE_CAROUSEL', []):
        if item.get('source'):
            photos.extend(_fetch_photos(item.get('source'), item.get('count', 2)))

    app.cache.set('home_photos', photos, timeout=300)
    return photos


def get_items_by_card(cards):
    if app.cache.get(HOME_ITEMS_CACHE_KEY):
        return app.cache.get(HOME_ITEMS_CACHE_KEY)

    items_by_card = {}
    for card in cards:
        if card['config'].get('product'):
            items_by_card[card['label']] = superdesk.get_resource_service('wire_search').\
                get_product_items(ObjectId(card['config']['product']), card['config']['size'])

    app.cache.set(HOME_ITEMS_CACHE_KEY, items_by_card, timeout=300)
    return items_by_card


def get_home_data():
    user = get_user()
    cards = list(superdesk.get_resource_service('cards').get(None, None))
    company_id = str(user['company']) if user and user.get('company') else None
    items_by_card = get_items_by_card(cards)

    return {
        'photos': get_photos(),
        'cards': cards,
        'itemsByCard': items_by_card,
        'products': get_products_by_company(company_id),
        'user': str(user['_id']) if user else None,
        'company': company_id,
        'formats': [{'format': f['format'], 'name': f['name']} for f in app.download_formatters.values()],
    }


def get_previous_versions(item):
    if item.get('ancestors'):
        return sorted(
            list(app.data.find_list_of_ids('wire_search', item['ancestors'])),
            key=itemgetter('versioncreated'),
            reverse=True
        )
    return []


@blueprint.route('/')
@login_required
def index():
    return flask.render_template('home.html', data=get_home_data())


@blueprint.route('/wire')
@login_required
def wire():
    return flask.render_template('wire_index.html', data=get_view_data())


@blueprint.route('/bookmarks')
@login_required
def bookmarks():
    data = get_view_data()
    data['bookmarks'] = True
    return flask.render_template('wire_bookmarks.html', data=data)


@blueprint.route('/search')
def search():
    response = get_internal('wire_search')
    return send_response('wire_search', response)


@blueprint.route('/download/<_ids>')
@login_required
def download(_ids):
    user = get_user(required=True)
    items = [get_entity_or_404(_id, 'items') for _id in _ids.split(',')]
    _file = io.BytesIO()
    _format = flask.request.args.get('format', 'text')
    formatter = app.download_formatters[_format]['formatter']
    mimetype = None
    attachment_filename = '%s-newsroom.zip' % utcnow().strftime('%Y%m%d%H%M')
    if len(items) == 1:
        item = items[0]
        parse_dates(item)  # fix for old items
        _file.write(formatter.format_item(item))
        _file.seek(0)
        mimetype = formatter.get_mimetype(item)
        attachment_filename = secure_filename(formatter.format_filename(item))
    else:
        with zipfile.ZipFile(_file, mode='w') as zf:
            for item in items:
                parse_dates(item)  # fix for old items
                zf.writestr(
                    secure_filename(formatter.format_filename(item)),
                    formatter.format_item(item)
                )
        _file.seek(0)

    update_action_list(_ids.split(','), 'downloads', force_insert=True)
    app.data.insert('history', items, action='download', user=user)
    return flask.send_file(_file, mimetype=mimetype, attachment_filename=attachment_filename, as_attachment=True)


@blueprint.route('/wire_share', methods=['POST'])
@login_required
def share():
    current_user = get_user(required=True)
    data = get_json_or_400()
    assert data.get('users')
    assert data.get('items')
    items = [get_entity_or_404(_id, 'items') for _id in data.get('items')]
    with app.mail.connect() as connection:
        for user_id in data['users']:
            user = superdesk.get_resource_service('users').find_one(req=None, _id=user_id)
            if not user or not user.get('email'):
                continue
            template_kwargs = {
                'recipient': user,
                'sender': current_user,
                'items': items,
                'message': data.get('message'),
            }
            send_email(
                [user['email']],
                gettext('From %s: %s' % (app.config['SITE_NAME'], items[0]['headline'])),
                text_body=flask.render_template('share_item.txt', **template_kwargs),
                html_body=flask.render_template('share_item.html', **template_kwargs),
                sender=current_user['email'],
                connection=connection
            )
    update_action_list(data.get('items'), 'shares')
    return flask.jsonify(), 201


@blueprint.route('/wire_bookmark', methods=['POST', 'DELETE'])
@login_required
def bookmark():
    """Bookmark an item.

    Stores user id into item.bookmarks array.
    Uses mongodb to update the array and then pushes updated array to elastic.
    """
    data = get_json_or_400()
    assert data.get('items')
    update_action_list(data.get('items'), 'bookmarks')
    user_id = get_user_id()
    push_user_notification('bookmarks', count=get_bookmarks_count(user_id))
    return flask.jsonify(), 200


def update_action_list(items, action_list, force_insert=False):
    """
    Stores user id into array of action_list of an item
    :param items: items to be updated
    :param action_list: field name of the list
    :param force_insert: inserts into list regardless of the http method
    :return:
    """
    user_id = get_user_id()
    if user_id:
        db = app.data.get_mongo_collection('items')
        elastic = app.data._search_backend('items')
        if flask.request.method == 'POST' or force_insert:
            updates = {'$addToSet': {action_list: user_id}}
        else:
            updates = {'$pull': {action_list: user_id}}
        for item_id in items:
            result = db.update_one({'_id': item_id}, updates)
            if result.modified_count:
                modified = db.find_one({'_id': item_id})
                elastic.update('items', item_id, {action_list: modified[action_list]})


@blueprint.route('/wire/<_id>/copy', methods=['POST'])
@login_required
def copy(_id):
    get_entity_or_404(_id, 'items')
    update_action_list([_id], 'copies')
    return flask.jsonify(), 200


@blueprint.route('/wire/<_id>/versions')
@login_required
def versions(_id):
    item = get_entity_or_404(_id, 'items')
    items = get_previous_versions(item)
    return flask.jsonify({'_items': items})


@blueprint.route('/wire/<_id>')
@login_required
def item(_id):
    item = get_entity_or_404(_id, 'items')
    if flask.request.args.get('format') == 'json':
        return flask.jsonify(item)
    previous_versions = get_previous_versions(item)
    if 'print' in flask.request.args:
        template = 'wire_item_print.html'
        update_action_list([_id], 'prints', force_insert=True)
    else:
        template = 'wire_item.html'
    return flask.render_template(template, item=item, previous_versions=previous_versions)
