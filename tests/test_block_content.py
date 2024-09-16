import io
import json
import zipfile
from datetime import timedelta, datetime

import re
import bson
import lxml.etree
from superdesk.utc import utcnow

from .fixtures import items, init_items, init_auth, agenda_items, init_agenda_items # noqa
from .test_push import upload_binary
import pytest

items_ids = [item['_id'] for item in items[:2]]
item = items[:2][0]


def download_zip_file(client, _format, section):
    resp = client.get(f'/download/{",".join(items_ids)}?format={_format}&type={section}', follow_redirects=True)
    assert resp.status_code == 200
    assert resp.mimetype == 'application/zip'

    content_disposition = resp.headers.get('Content-Disposition')
    assert content_disposition is not None, "Content-Disposition header is missing"

    filename_match = re.search(r'filename=(\d{12})-newsroom\.zip', content_disposition)
    assert filename_match, f"Filename in Content-Disposition does not match expected pattern: {content_disposition}"

    filename_timestamp = filename_match.group(1)
    file_datetime = datetime.strptime(filename_timestamp, "%Y%m%d%H%M")

    now = datetime.utcnow()
    assert now - timedelta(
        minutes=5) <= file_datetime <= now, f"Filename timestamp {filename_timestamp} is not within the expected range"

    return io.BytesIO(resp.get_data())


def text_content_test(content):
    content = content.decode('utf-8').split('\n')
    assert 'AMAZON-BOOKSTORE-OPENING' in content[0]
    assert 'Amazon Is Opening More Bookstores' in content[1]
    assert '<p>' not in content
    assert 'Block 4' == content[-2]


def nitf_content_test(content):
    root = lxml.etree.fromstring(content)
    assert 'nitf' == root.tag
    head = root.find('head')
    assert items[0]['headline'] == head.find('title').text


def ninjs_content_test(content):
    data = json.loads(content)
    assert data.get('associations', {}).get('editor_1')
    assert not data.get('associations', {}).get('editor_0')
    assert not data.get('associations', {}).get('editor_2')
    assert data['headline'] == 'Amazon Is Opening More Bookstores'
    assert 'editor_1' in data['body_html']
    assert 'editor_0' not in data['body_html']


def ninjs_block_download_example(content):
    data = json.loads(content)
    assert data.get('associations', {}).get('editor_1')
    assert not data.get('associations', {}).get('editor_0')
    assert not data.get('associations', {}).get('editor_2')
    assert data['headline'] == 'Amazon Is Opening More Bookstores'
    assert 'video' in data['body_html']
    assert 'img' not in data['body_html']
    assert 'blockquote' not in data['body_html']
    assert 'audio' not in data['body_html']


def newsmlg2_content_test(content):
    root = lxml.etree.fromstring(content)
    assert 'newsMessage' in root.tag


def filename(name, item):
    return f'{item["versioncreated"].strftime("%Y%m%d%H%M")}-{name}'


wire_formats = [
    {
        'format': 'text',
        'mimetype': 'text/plain',
        'filename': filename('amazon-bookstore-opening.txt', item),
        'test_content': text_content_test,
    },
    {
        'format': 'nitf',
        'mimetype': 'application/xml',
        'filename': filename('amazon-bookstore-opening.xml', item),
        'test_content': nitf_content_test,
    },
    {
        'format': 'newsmlg2',
        'mimetype': 'application/vnd.iptc.g2.newsitem+xml',
        'filename': filename('amazon-bookstore-opening.xml', item),
        'test_content': newsmlg2_content_test,
    },
    {
        'format': 'picture',
        'mimetype': 'image/jpeg',
        'filename': 'baseimage.jpg',
    },
]


def setup_block_embeds(client, app):
    media_id = bson.ObjectId()
    associations = {
        'featuremedia': {
            'mimetype': 'image/jpeg',
            'type': 'picture',
            'renditions': {
                'baseImage': {
                    'mimetype': 'image/jpeg',
                    'media': str(media_id),
                    'href': 'http://a.b.c/xxx.jpg',
                },
                '16-9': {
                    'mimetype': 'image/jpeg',
                    'href': 'http://a.b.c/xxx.jpg',
                    'media': str(media_id),
                    'width': 1280,
                    'height': 720,
                },
                '4-3': {
                    "href": "/assets/633d11b9fb5122dcf06a6f02",
                    "width": 800,
                    "height": 600,
                    'media': str(media_id),
                    "mimetype": "image/jpeg",
                },
            },
        },
        "editor_1": {
            "type": "video",
            "renditions": {
                "original": {
                    "mimetype": "video/mp4",
                    "href": "/assets/640ff0bdfb5122dcf06a6fc3",
                    'media': str(media_id),
                },
            },
            "mimetype": "video/mp4",
            "products": [
                {"code": "123", "name": "Product A"},
                {"code": "321", "name": "Product B"},
            ],
        },
        "editor_0": {
            "type": "audio",
            "renditions": {
                "original": {
                    "mimetype": "audio/mp3",
                    "href": "/assets/640feb9bfb5122dcf06a6f7c",
                    "media": "640feb9bfb5122dcf06a6f7c",
                },
            },
            "mimetype": "audio/mp3",
            "products": [{"code": "999", "name": "NSW News"}],
        },
        "editor_2": {
            "type": "picture",
            "renditions": {
                "4-3": {
                    "href": "/assets/633d11b9fb5122dcf06a6f02",
                    "width": 800,
                    "height": 600,
                    "mimetype": "image/jpeg",
                    "media": "633d11b9fb5122dcf06a6f02",
                },
                "16-9": {
                    "href": "/assets/633d0f59fb5122dcf06a6ee8",
                    "width": 1280,
                    "height": 720,
                    "mimetype": "image/jpeg",
                    "media": "633d0f59fb5122dcf06a6ee8",
                    "poi": {},
                },
            },
            "products": [{"code": "888"}],
        },
        "editor_3": None,
    }
    upload_binary('picture.jpg', client, media_id=str(media_id))

    app.data.update('items', item['_id'], {
        'associations': associations,
        'body_html': (
            '<p>Block 1</p>'
            '<!-- EMBED START Audio {id: "editor_0"} -->'
            '<figure>'
            '<audio controls src="/assets/640feb9bfb5122dcf06a6f7c" '
            'alt="minns" width="100%" height="100%"></audio>'
            '<figcaption>minns</figcaption>'
            '</figure>'
            '<!-- EMBED END Audio {id: "editor_0"} -->'
            '<p><br></p>'
            '<p>Block 2</p>'
            '<!-- EMBED START Video {id: "editor_1"} -->'
            '<figure>'
            '<video controls src="/assets/640ff0bdfb5122dcf06a6fc3"'
            ' alt="Scomo text" width="100%" height="100%"></video>'
            '<figcaption>Scomo whinging</figcaption>'
            '</figure>'
            '<!-- EMBED END Video {id: "editor_1"} -->'
            '<p><br></p>Block 3<p></p>'
            '<!-- EMBED START Image {id: "editor_2"} -->'
            '<figure>'
            '<img src="/assets/6189e8a48b37621081610714_newsroom_custom" '
            'alt="SCOTT MORRISON MELBOURNE VISIT" id="editor_2">'
            '<figcaption>Prime Minister Scott Morrison and Liberal member for Higgins Katie Allen</figcaption>'
            '</figure>'
            '<!-- EMBED END Image {id: "editor_2"} -->'
            '<p>Block 4</p>'
            '<div class="embed-block">'
            '<blockquote class="twitter-tweet">'
            '<p lang="en" dir="ltr">Pix: Tennis United Cup Sydney '
            '<a href="https://t.co/vetYNOuxVM">https://t.co/vetYNOuxVM</a> '
            '<a href="https://t.co/bbwu9k85k0">pic.twitter.com/bbwu9k85k0</a>'
            '</p>&mdash; AAP Photos (@aap_photos) '
            '<a href="https://twitter.com/aap_photos/status/1607971585037840384?ref_src=twsrc%5Etfw">'
            'December 28, 2022</a>'
            '</blockquote>'
            '<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>'
            '</div>'
        )
    }, item)


def test_download_single_block(client, app):
    setup_block_embeds(client, app)
    for _format in wire_formats:
        resp = client.get(f'/download/{item["_id"]}?format={_format["format"]}', follow_redirects=True)
        assert resp.status_code == 200
        assert resp.mimetype == _format['mimetype']
        assert (resp.headers.get('Content-Disposition') in
                [f'attachment; filename={_format["filename"]}', f'attachment; filename="{_format["filename"]}"'])


@pytest.fixture
def setup_data(client, app):
    setup_block_embeds(client, app)
    app.config['EMBED_PRODUCT_FILTERING'] = True
    app.data.insert('companies', [{
        '_id': '3',
        'name': 'Block Conent.',
        'is_enabled': True,
        'embedded': {
            "social_media_display": True,
            "sdpermit_display": True,
            "video_display": False,
            "audio_display": True,
            "images_display": True,
            "all_display": False,
            "social_media_download": True,
            "video_download": True,
            "audio_download": False,
            "images_download": True,
            "all_download": False,
            "sdpermit_download": True
        }
    }])
    user = app.data.find_one('users', req=None, first_name='admin')
    assert user
    app.data.update('users', user['_id'], {'company': '3'}, user)
    app.data.insert('products', [{
        '_id': 13,
        'name': 'product test',
        'sd_product_id': '123',
        'companies': ['3'],
        'is_enabled': True,
        'product_type': 'wire'
    }])


def start_test_block_download(client, app, setup_data):
    for _format in wire_formats:
        _file = download_zip_file(client, _format['format'], 'wire')
        with zipfile.ZipFile(_file) as zf:
            assert _format['filename'] in zf.namelist()
            content = zf.open(_format['filename']).read()
            if _format.get('test_content'):
                _format['test_content'](content)


def assert_history(app):
    history = app.data.find('history', None, None)
    assert (len(wire_formats) * len(items_ids)) == history.count()
    assert 'download' == history[0]['action']
    assert history[0].get('user')
    assert history[0].get('versioncreated') + timedelta(seconds=2) >= utcnow()
    assert history[0].get('item') in items_ids
    assert history[0].get('version')
    assert history[0].get('company') == '3'
    assert history[0].get('section') == 'wire'


def test_block_download_with_config(client, app, setup_data):
    start_test_block_download(client, app, setup_data)
    assert_history(app)


def test_ninjs_download(client, app):
    setup_block_embeds(client, app)
    app.config['EMBED_PRODUCT_FILTERING'] = True
    app.data.insert('companies', [{
        '_id': '1',
        'name': 'Press co.',
        'is_enabled': True,
        'embedded': {
            "social_media_display": True,
            "video_display": True,
            "audio_display": True,
            "images_display": True,
            "all_display": True,
            "social_media_download": True,
            "video_download": True,
            "audio_download": True,
            "images_download": True,
            "all_download": True,
            "sdpermit_display": True,
            "sdpermit_download": True
        }
    }])
    user = app.data.find_one('users', req=None, first_name='admin')
    assert user
    app.data.update('users', user['_id'], {'company': '1'}, user)
    app.data.insert('products', [{
        '_id': 10,
        'name': 'product test',
        'sd_product_id': '123',
        'companies': ['1'],
        'is_enabled': True,
        'product_type': 'wire'
    }])
    app.general_setting('news_api_allowed_renditions', 'Foo', default='16-9,4-3')

    _file = download_zip_file(client, 'downloadninjs', 'wire')
    with zipfile.ZipFile(_file) as zf:
        assert filename('amazon-bookstore-opening.json', item) in zf.namelist()
        content = zf.open(filename('amazon-bookstore-opening.json', item)).read()
        ninjs_content_test(content)

    history = app.data.find('history', None, None)
    assert 4 == history.count()
    assert 'download' in history[0]['action']
    assert 'download' in history[1]['action']
    assert history[0].get('user')
    assert history[0].get('versioncreated') + timedelta(seconds=2) >= utcnow()
    assert history[0].get('item') in items_ids
    assert history[0].get('version')
    assert history[0].get('company') == '1'
    assert history[0].get('section') == 'wire'


def test_ninjs_block_download_default(client, app):
    setup_block_embeds(client, app)
    app.config['EMBED_PRODUCT_FILTERING'] = True
    app.data.insert('companies', [{
        '_id': '1',
        'name': 'Press co.',
        'is_enabled': True,
        'embedded': {
            "social_media_display": True,
            "video_display": True,
            "audio_display": True,
            "images_display": True,
            "all_display": True,
            "social_media_download": False,
            "video_download": False,
            "audio_download": False,
            "images_download": False,
            "all_download": False,
            "sdpermit_display": True,
            "sdpermit_download": False
        }
    }])
    user = app.data.find_one('users', req=None, first_name='admin')
    assert user
    app.data.update('users', user['_id'], {'company': '1'}, user)
    app.data.insert('products', [{
        '_id': 10,
        'name': 'product test',
        'sd_product_id': '123',
        'companies': ['1'],
        'is_enabled': True,
        'product_type': 'wire'
    }])
    app.general_setting('news_api_allowed_renditions', 'Foo', default='16-9,4-3')
    _file = download_zip_file(client, 'downloadninjs', 'wire')
    with zipfile.ZipFile(_file) as zf:
        assert filename('amazon-bookstore-opening.json', item) in zf.namelist()
        content = zf.open(filename('amazon-bookstore-opening.json', item)).read()
        ninjs_content_test(content)

    history = app.data.find('history', None, None)
    assert 4 == history.count()
    assert 'download' in history[0]['action']
    assert 'download' in history[1]['action']
    assert history[0].get('user')
    assert history[0].get('versioncreated') + timedelta(seconds=2) >= utcnow()
    assert history[0].get('item') in items_ids
    assert history[0].get('version')
    assert history[0].get('company') == '1'
    assert history[0].get('section') == 'wire'


def test_ninjs_block_download_example(client, app):
    setup_block_embeds(client, app)
    app.config['EMBED_PRODUCT_FILTERING'] = True
    app.data.insert('companies', [{
        '_id': '2',
        'name': 'Press01 co.',
        'is_enabled': True,
        'embedded': {
            "social_media_display": True,
            "video_display": True,
            "audio_display": True,
            "images_display": True,
            "all_display": True,
            "social_media_download": False,
            "video_download": True,
            "audio_download": False,
            "images_download": False,
            "all_download": False,
            "sdpermit_display": True,
            "sdpermit_download": False
        }
    }])
    user = app.data.find_one('users', req=None, first_name='admin')
    assert user
    app.data.update('users', user['_id'], {'company': '2'}, user)
    app.data.insert('products', [{
        '_id': 10,
        'name': 'product test',
        'sd_product_id': '123',
        'companies': ['2'],
        'is_enabled': True,
        'product_type': 'wire'
    }])
    app.general_setting('news_api_allowed_renditions', 'Foo', default='16-9,4-3')
    _file = download_zip_file(client, 'downloadninjs', 'wire')
    with zipfile.ZipFile(_file) as zf:
        assert filename('amazon-bookstore-opening.json', item) in zf.namelist()
        content = zf.open(filename('amazon-bookstore-opening.json', item)).read()
        ninjs_block_download_example(content)

    history = app.data.find('history', None, None)
    assert 4 == history.count()
    assert 'download' in history[0]['action']
    assert 'download' in history[1]['action']
    assert history[0].get('user')
    assert history[0].get('versioncreated') + timedelta(seconds=2) >= utcnow()
    assert history[0].get('item') in items_ids
    assert history[0].get('version')
    assert history[0].get('company') == '2'
    assert history[0].get('section') == 'wire'
