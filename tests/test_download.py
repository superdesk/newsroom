
import io
import lxml
import zipfile

from datetime import timedelta
from superdesk.utc import utcnow

from .fixtures import items, init_items, init_auth, agenda_items, init_agenda_items  # noqa

items_ids = [item['_id'] for item in items[:2]]


def download_file(client, _format):
    resp = client.get('/download/%s?format=%s&type=wire' % (','.join(items_ids), _format))
    assert resp.status_code == 200
    assert resp.mimetype == 'application/zip'
    _file = io.BytesIO(resp.get_data())
    return _file


def download_agenda_file(client, _format):
    resp = client.get('/download/%s?format=%s&type=agenda' % (','.join([agenda_items[0]['_id']]), _format))
    assert resp.status_code == 200
    assert resp.mimetype == 'application/zip'
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
    content = content.decode('utf-8').split('\n')
    assert 'Conference Planning' in content[0]
    assert 'Prime Conference' in content[0]


wire_formats = [
    {
        'format': 'text',
        'filename': 'tagfoo.txt',
        'test_content': text_content_test,
    },
    {
        'format': 'nitf',
        'filename': 'tagfoo.xml',
        'test_content': nitf_content_test,
    },
    {
        'format': 'newsmlg2',
        'filename': 'tagfoo.xml',
        'test_content': newsmlg2_content_test,
    }
]


agenda_formats = [
    {
        'format': 'text',
        'filename': 'urnconference.txt',
        'test_content': text_agenda_content_test,
    },
    {
        'format': 'json',
        'filename': 'urnconference.xml',
        'test_content': json_agenda_content_test,
    }
]


def test_wire_download(client, app):
    for _format in wire_formats:
        _file = download_file(client, _format['format'])
        with zipfile.ZipFile(_file) as zf:
            assert _format['filename'] in zf.namelist()
            content = zf.open(_format['filename']).read()
            _format['test_content'](content)
    history = app.data.find('history', None, None)
    assert len(items_ids) == history.count()
    assert 'download' == history[0]['action']
    assert history[0].get('user')
    assert history[0].get('created') + timedelta(seconds=2) >= utcnow()
    assert history[0].get('item') in items_ids
    assert history[0].get('version')
    assert history[0].get('company') is None


def test_agenda_download(client, app):
    for _format in agenda_formats:
        _file = download_agenda_file(client, _format['format'])
        with zipfile.ZipFile(_file) as zf:
            assert _format['filename'] in zf.namelist()
            content = zf.open(_format['filename']).read()
            _format['test_content'](content)
    history = app.data.find('history', None, None)
    assert 1 == history.count()
    assert 'download' == history[0]['action']
    assert history[0].get('user')
    assert history[0].get('created') + timedelta(seconds=2) >= utcnow()
    assert history[0].get('item') == agenda_items[0]['_id']
    assert history[0].get('company') is None
