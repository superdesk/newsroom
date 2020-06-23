import io
import json

import bson
import lxml
import zipfile
import icalendar

from datetime import timedelta
from superdesk.utc import utcnow

from .fixtures import items, init_items, init_auth, agenda_items, init_agenda_items  # noqa
from .test_push import upload_binary

items_ids = [item['_id'] for item in items[:2]]
item = items[:2][0]


def download_zip_file(client, _format, section):
    resp = client.get('/download/%s?format=%s&type=%s' % (','.join(items_ids), _format, section), follow_redirects=True)
    assert resp.status_code == 200
    assert resp.mimetype == 'application/zip'
    assert resp.headers.get('Content-Disposition') == 'attachment; filename={}-newsroom.zip'.format(
        utcnow().strftime('%Y%m%d%H%M'))
    _file = io.BytesIO(resp.get_data())
    return _file


def text_content_test(content):
    content = content.decode('utf-8').split('\n')
    assert 'AMAZON-BOOKSTORE-OPENING' in content[0]
    assert 'Amazon Is Opening More Bookstores' in content[1]
    assert '<p>' not in content
    assert 'Next line' == content[-2]


def nitf_content_test(content):
    tree = lxml.etree.parse(io.BytesIO(content))
    root = tree.getroot()
    assert 'nitf' == root.tag
    head = root.find('head')
    assert items[0]['headline'] == head.find('title').text


def newsmlg2_content_test(content):
    tree = lxml.etree.parse(io.BytesIO(content))
    root = tree.getroot()
    assert 'newsMessage' in root.tag


def text_agenda_content_test(content):
    content = content.decode('utf-8').split('\n')
    assert 'Conference Planning' in content[0]
    assert 'Slugline:Prime Conference' in content[1]
    assert '<p>' not in content


def json_agenda_content_test(content):
    data = json.loads(content.decode('utf-8'))
    assert data['name'] == 'Conference Planning'
    assert data['slugline'] == 'Prime Conference'


def ical_agenda_content_test(content):
    cal = icalendar.cal.Calendar.from_ical(content)
    assert cal


def filename(filename, item):
    return '%s-%s' % (item['versioncreated'].strftime('%Y%m%d%H%M'), filename)


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
        'filename': 'baseimage.jpg'
    },
]

agenda_formats = [
    {
        'format': 'text',
        'mimetype': 'text/plain',
        'filename': 'prime-conference.txt',
        'test_content': text_agenda_content_test,
    },
    {
        'format': 'json',
        'mimetype': 'application/json',
        'filename': 'prime-conference.json',
        'test_content': json_agenda_content_test,
    },
    {
        'format': 'ical',
        'mimetype': 'text/calendar',
        'filename': 'prime-conference.ical',
        'test_content': ical_agenda_content_test,
    },
]


def setup_image(client, app):
    media_id = str(bson.ObjectId())
    upload_binary('picture.jpg', client, media_id=media_id)
    associations = {
        'featuremedia': {
            'mimetype': 'image/jpeg',
            'renditions': {
                'baseImage': {
                    'mimetype': 'image/jpeg',
                    'media': media_id,
                },
            }
        }
    }
    app.data.update('items', item['_id'], {'associations': associations}, item)


def test_download_single(client, app):
    setup_image(client, app)
    for _format in wire_formats:
        resp = client.get('/download/%s?format=%s' % (item['_id'], _format['format']), follow_redirects=True)
        assert resp.status_code == 200
        assert resp.mimetype == _format['mimetype']
        assert resp.headers.get('Content-Disposition') in ['attachment; filename=%s' % _format['filename'],
                                                           'attachment; filename="%s"' % _format['filename']]


def test_wire_download(client, app):
    setup_image(client, app)
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
    assert history[0].get('company') is None
    assert history[0].get('section') == 'wire'


def test_agenda_download(client, app):
    setup_image(client, app)
    for _format in agenda_formats:
        resp = client.get('/download/%s?format=%s&type=agenda' % (agenda_items[0]['_id'], _format['format']))
        assert resp.status_code == 200, resp.get_data()
        assert resp.mimetype == _format['mimetype']
        if _format.get('test_content'):
            _format['test_content'](resp.get_data())
        assert resp.headers.get('content-disposition') == 'attachment; filename=%s' % filename(
            _format['filename'], agenda_items[0])
    history = app.data.find('history', None, None)
    assert (len([w for w in wire_formats if w['format'] != 'picture']) * 1) == history.count()
    assert 'download' == history[0]['action']
    assert history[0].get('user')
    assert history[0].get('versioncreated') + timedelta(seconds=2) >= utcnow()
    assert history[0].get('item') == agenda_items[0]['_id']
    assert history[0].get('company') is None
