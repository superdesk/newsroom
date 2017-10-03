
import io
import zipfile
from pytest import fixture


@fixture(autouse=True)
def init(app):
    app.data.insert('items', [{
        '_id': 'tag:foo',
        'version': 2,
        'headline': 'Amazon Is Opening More Bookstores',
        'slugline': 'AMAZON-BOOKSTORE-OPENING',
        'body_html': '<p>New stores will open in DC and Austin in 2018.</p>',
    }])


def test_download_item(client):
    resp = client.get('/download/tag:foo?version=2')
    assert resp.status_code == 200
    assert resp.mimetype == 'application/zip'
    _file = io.BytesIO(resp.get_data())
    with zipfile.ZipFile(_file) as zf:
        assert 'tagfoo.txt' in zf.namelist()
        content = zf.open('tagfoo.txt').read().decode('utf-8').split('\n')
        assert 'AMAZON-BOOKSTORE-OPENING' in content[0]
        assert 'Amazon Is Opening More Bookstores' in content[1]
        assert '<p>' not in content
