import io
import json
import zipfile
from datetime import timedelta
import re
import bson
import lxml.etree
import pytest
from superdesk.utc import utcnow

from .fixtures import items, init_items, init_auth, agenda_items, init_agenda_items # noqa
from .test_push import upload_binary

items_ids = [item['_id'] for item in items[:2]]
item = items[:2][0]


@pytest.fixture
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
            # for base permission check,pass
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
            # for base permission check ,disable
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
            # for base permission check, pass
            "products": [{"code": "123"}],
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


@pytest.fixture
def configure_app(app):
    app.config['EMBED_PRODUCT_FILTERING'] = True
    return app


def setup_company_data(app, company_id, company_name, embedded):
    app.data.insert('companies', [{
        '_id': company_id,
        'name': company_name,
        'is_enabled': True,
        'embedded': embedded
    }])
    user = app.data.find_one('users', req=None, first_name='admin')
    assert user
    app.data.update('users', user['_id'], {'company': company_id}, user)
    app.data.insert('products', [{
        '_id': int(company_id) * 10,
        'name': 'product test',
        # base product check
        'sd_product_id': '123',
        'companies': [company_id],
        'is_enabled': True,
        'product_type': 'wire'
    }])


@pytest.fixture(params=[
    ('3', 'Block Conent.', {
        "social_media_display": True, "sdpermit_display": True, "video_display": False,
        "audio_display": True, "images_display": True, "all_display": False,
        "social_media_download": True, "video_download": True, "audio_download": False,
        "images_download": True, "all_download": False, "sdpermit_download": True
    }),
    ('2', 'Press01 co.', {
        "social_media_display": True, "video_display": True, "audio_display": True,
        "images_display": True, "all_display": True, "social_media_download": False,
        "video_download": True, "audio_download": False, "images_download": False,
        "all_download": False, "sdpermit_display": True, "sdpermit_download": False
    }),
    ('1', 'Press co.', {
        "social_media_display": True, "video_display": True, "audio_display": True,
        "images_display": True, "all_display": True, "social_media_download": False,
        "video_download": False, "audio_download": False, "images_download": False,
        "all_download": False, "sdpermit_display": True, "sdpermit_download": False
    })
])
def company_data(request):
    return request.param


@pytest.fixture
def setup_data(client, app, configure_app, setup_block_embeds, company_data):
    company_id, company_name, embedded = company_data

    app.data.insert('companies', [{
        '_id': company_id,
        'name': company_name,
        'is_enabled': True,
        'embedded': embedded
    }])

    user = app.data.find_one('users', req=None, first_name='admin')
    assert user
    app.data.update('users', user['_id'], {'company': company_id}, user)

    app.data.insert('products', [{
        '_id': int(company_id * 10),
        'name': 'product test',
        'sd_product_id': '123',
        'companies': [company_id],
        'is_enabled': True,
        'product_type': 'wire'
    }])
    return app, company_id


def download_zip_file(client, _format, section):
    resp = client.get('/download/{0}?format={1}&type={2}'.format(','.join(items_ids), _format, section),
                      follow_redirects=True)
    assert resp.status_code == 200
    assert resp.mimetype == 'application/zip'
    assert resp.headers.get('Content-Disposition') == (
        'attachment; filename={0}-newsroom.zip'.format(utcnow().strftime("%Y%m%d%H%M"))
    )
    return io.BytesIO(resp.get_data())


def text_content_test(content):
    content = content.decode('utf-8').split('\n')
    assert 'AMAZON-BOOKSTORE-OPENING' in content[0]
    assert 'Amazon Is Opening More Bookstores' in content[1]
    assert '<p>' not in content


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


def ninjs_block_download_video(content):
    data = json.loads(content)
    assert data.get('associations', {}).get('editor_1')
    assert not data.get('associations', {}).get('editor_0')
    assert not data.get('associations', {}).get('editor_2')
    assert data['headline'] == 'Amazon Is Opening More Bookstores'
    assert 'video' in data['body_html']
    assert 'img' not in data['body_html']
    assert 'blockquote' not in data['body_html']
    assert 'audio' not in data['body_html']


def ninjs_block_download_audio_image(content):
    data = json.loads(content)
    assert not data.get('associations', {}).get('editor_1')
    assert not data.get('associations', {}).get('editor_0')
    assert data.get('associations', {}).get('editor_2')
    assert data['headline'] == 'Amazon Is Opening More Bookstores'
    assert 'video' not in data['body_html']
    assert 'img' in data['body_html']
    assert 'blockquote' not in data['body_html']
    assert 'audio' not in data['body_html']


def htmlpackage_block_download_video(content):
    data = json.loads(content)
    assert data.get('associations', {}).get('editor_1')
    assert not data.get('associations', {}).get('editor_0')
    assert not data.get('associations', {}).get('editor_2')
    assert data['headline'] == 'Amazon Is Opening More Bookstores'
    assert 'video' in data['body_html']
    assert 'img' not in data['body_html']
    assert 'blockquote' not in data['body_html']
    assert 'audio' not in data['body_html']


def htmlpackage_block_download_audio_image(html_content_file):
    html_content = html_content_file.decode('utf-8')
    assert re.search(r'<h1>Amazon Is Opening More Bookstores</h1>', html_content)
    assert not re.search(r'<video', html_content)
    assert re.search(r'<img', html_content)
    assert not re.search(r'<blockquote', html_content)
    assert not re.search(r'<audio', html_content)


def newsmlg2_content_test(content):
    root = lxml.etree.fromstring(content)
    assert 'newsMessage' in root.tag


def filename(name, item):
    return '{0}-{1}'.format(item["versioncreated"].strftime("%Y%m%d%H%M"), name)


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


@pytest.mark.parametrize('_format', wire_formats)
def test_download_single_block(client, app, setup_block_embeds, _format):
    resp = client.get(
        f'/download/{item["_id"]}?format={_format["format"]}',
        follow_redirects=True
    )
    assert resp.status_code == 200
    assert resp.mimetype == _format['mimetype']
    assert (resp.headers.get('Content-Disposition') in
            ['attachment; filename={0}'.format(_format["filename"]),
             'attachment; filename="{0}"'.format(_format["filename"])])


@pytest.mark.parametrize('company_id, company_name, embedded', [
    ('3', 'Block Conent.', {
        "social_media_display": True, "sdpermit_display": True, "video_display": False,
        "audio_display": True, "images_display": True, "all_display": False,
        "social_media_download": True, "video_download": True, "audio_download": False,
        "images_download": True, "all_download": False, "sdpermit_download": True
    }),
    ('2', 'Press01 co.', {
        "social_media_display": True, "video_display": True, "audio_display": True,
        "images_display": True, "all_display": True, "social_media_download": False,
        "video_download": True, "audio_download": False, "images_download": False,
        "all_download": False, "sdpermit_display": True, "sdpermit_download": False
    }),
    ('1', 'Press co.', {
        "social_media_display": True, "video_display": True, "audio_display": True,
        "images_display": True, "all_display": True, "social_media_download": False,
        "video_download": False, "audio_download": False, "images_download": False,
        "all_download": False, "sdpermit_display": True, "sdpermit_download": False
    })
])
def test_block_download_with_config(client, app, setup_block_embeds, configure_app, company_id, company_name, embedded):
    setup_company_data(app, company_id, company_name, embedded)
    for _format in wire_formats:
        _file = download_zip_file(client, _format['format'], 'wire')
        with zipfile.ZipFile(_file) as zf:
            assert _format['filename'] in zf.namelist()
            content = zf.open(_format['filename']).read()
            if _format.get('test_content'):
                _format['test_content'](content)

    history = app.data.find('history', None, None)
    assert (len(wire_formats) * len(items_ids)) == history.count()
    assert 'download' == history[0]['action']
    assert history[0].get('user')
    assert history[0].get('versioncreated') + timedelta(seconds=2) >= utcnow()
    assert history[0].get('item') in items_ids
    assert history[0].get('version')
    assert history[0].get('company') == company_id
    assert history[0].get('section') == 'wire'


COMPANY_DATA = [
    (
        '11',
        'AAP01',
        {
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
        },
        ninjs_block_download_video
    ),
    (
        '12',
        'AAP02',
        {
            "social_media_display": False,
            "video_display": True,
            "audio_display": True,
            "images_display": True,
            "all_display": False,
            "social_media_download": False,
            "video_download": False,
            "audio_download": True,
            "images_download": True,
            "all_download": False,
            "sdpermit_display": True,
            "sdpermit_download": True
        },
        ninjs_block_download_audio_image,
    ),
]


@pytest.mark.parametrize('company_data', COMPANY_DATA)
def test_ninjs_download(client, app, configure_app, setup_block_embeds, company_data):
    company_id, company_name, embedded, expected_content_test = company_data

    company = app.data.find_one('companies', req=None, _id=company_id)
    if company:
        app.data.update('companies', company_id, {
            'name': company_name,
            'is_enabled': True,
            'embedded': embedded
        }, company)
    else:
        app.data.insert('companies', [{
            '_id': company_id,
            'name': company_name,
            'is_enabled': True,
            'embedded': embedded
        }])

    user = app.data.find_one('users', req=None, first_name='admin')
    assert user
    app.data.update('users', user['_id'], {'company': company_id}, user)

    app.data.insert('products', [{
        '_id': int(company_id),
        'name': 'product test',
        'sd_product_id': '123',
        'companies': [company_id],
        'is_enabled': True,
        'product_type': 'wire'
    }])

    app.general_setting('news_api_allowed_renditions', 'Foo', default='16-9,4-3')

    _file = download_zip_file(client, 'downloadninjs', 'wire')
    with zipfile.ZipFile(_file) as zf:
        assert filename('amazon-bookstore-opening.json', item) in zf.namelist()
        content = zf.open(filename('amazon-bookstore-opening.json', item)).read()
        expected_content_test(content)

    history = app.data.find('history', None, None)
    assert 4 == history.count()
    assert 'download' in history[0]['action']
    assert 'download' in history[1]['action']
    assert history[0].get('user')
    assert history[0].get('versioncreated') + timedelta(seconds=2) >= utcnow()
    assert history[0].get('item') in items_ids
    assert history[0].get('version')
    assert history[0].get('company') == company_id
    assert history[0].get('section') == 'wire'


COMPANY_DATA_HTML = [
    (
        '13',
        'AAP03',
        {
            "social_media_display": False,
            "video_display": True,
            "audio_display": True,
            "images_display": True,
            "all_display": False,
            "social_media_download": False,
            "video_download": False,
            "audio_download": True,
            "images_download": True,
            "all_download": False,
            "sdpermit_display": True,
            "sdpermit_download": True
        },
        htmlpackage_block_download_audio_image,
    ),
]


@pytest.mark.parametrize('company_data_demo', COMPANY_DATA_HTML)
def test_htmlpackage_download(client, app, configure_app, setup_block_embeds, company_data_demo):
    def extract_nr_timestamps(filenames):
        timestamps = []
        for filename in filenames:
            match = re.match(r'(\d{12})-', filename)
            if match:
                timestamps.append(match.group(1))
        return sorted(timestamps, reverse=True)

    company_id, company_name, embedded, expected_content_test = company_data_demo

    company = app.data.find_one('companies', req=None, _id=company_id)
    if company:
        app.data.update('companies', company_id, {
            'name': company_name,
            'is_enabled': True,
            'embedded': embedded
        }, company)
    else:
        app.data.insert('companies', [{
            '_id': company_id,
            'name': company_name,
            'is_enabled': True,
            'embedded': embedded
        }])

    user = app.data.find_one('users', req=None, first_name='admin')
    assert user
    app.data.update('users', user['_id'], {'company': company_id}, user)

    app.data.insert('products', [{
        '_id': int(company_id),
        'name': 'product test',
        'sd_product_id': '123',
        'companies': [company_id],
        'is_enabled': True,
        'product_type': 'wire'
    }])

    app.general_setting('news_api_allowed_renditions', 'Foo', default='16-9,4-3')

    _file = download_zip_file(client, 'htmlpackage', 'wire')
    with zipfile.ZipFile(_file) as zf:
        filenames = [info.filename for info in zf.filelist]
        content = zf.open(filename('amazon-bookstore-opening.html', item)).read()
        expected_content_test(content)

    timestamps = extract_nr_timestamps(filenames)

    if len(timestamps) >= 2:
        current_datetime = timestamps[0]
        previous_datetime = timestamps[-1]

        expected_files = [
            f'{current_datetime}-amazon-bookstore-opening.html',
            f'{previous_datetime}-weather.html',
            'assets/633d11b9fb5122dcf06a6f02'
        ]

        missing_files = [file for file in expected_files if file not in filenames]

        if not missing_files:
            print("All files found, Test Pass.")
        else:
            raise AssertionError(
                f"The following expected files were not found in the ZIP file list: {', '.join(missing_files)}")
    else:
        raise AssertionError("Not enough timestamped files found in the ZIP archive")

    history = app.data.find('history', None, None)
    assert 4 == history.count()
    assert 'download' in history[0]['action']
    assert 'download' in history[1]['action']
    assert history[0].get('user')
    assert history[0].get('versioncreated') + timedelta(seconds=2) >= utcnow()
    assert history[0].get('item') in items_ids
    assert history[0].get('version')
    assert history[0].get('company') == company_id
    assert history[0].get('section') == 'wire'
