
import io
import lxml
import zipfile

from datetime import timedelta
from superdesk.utc import utcnow

from .fixtures import items, init_items, init_auth  # noqa

items_ids = [item['_id'] for item in items[:2]]


def download_file(client, _format):
    resp = client.get('/download/%s?format=%s' % (','.join(items_ids), _format))
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


formats = [
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


def test_item_download(client, app):
    for _format in formats:
        _file = download_file(client, _format['format'])
        with zipfile.ZipFile(_file) as zf:
            assert _format['filename'] in zf.namelist()
            content = zf.open(_format['filename']).read()
            _format['test_content'](content)
    history = app.data.find('history', None, None)
    assert len(formats) * len(items_ids) == history.count()
    assert 'download' == history[0]['action']
    assert history[0].get('user')
    assert history[0].get('created') + timedelta(seconds=2) >= utcnow()
    assert history[0].get('item') in items_ids
    assert history[0].get('version')
    assert history[0].get('company') is None
