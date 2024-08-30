
from newsroom.settings import get_setting

from .fixtures import items, init_items, init_auth, init_company  # noqa
from .utils import post_json, get_json
from pytest import fixture


@fixture
def test_general_settings(client, app):
    app.general_setting('foo', 'Foo', default='bar')
    assert 'bar' == get_setting('foo')
    post_json(client, '/settings/general_settings', {'foo': 'baz'})
    assert 'baz' == get_setting('foo')
    post_json(client, '/settings/general_settings', {'foo': ''})
    assert 'bar' == get_setting('foo')

    # without key returns all settings with metadata
    assert 'foo' in get_setting()
    assert 'Foo' == get_setting()['foo']['label']
    assert 'bar' == get_setting()['foo']['default']


@fixture
def test_news_only_filter(client, app):
    query = get_setting('news_only_filter')
    assert query is None

    # reset default filter
    app.config['NEWS_ONLY_FILTER'] = []

    _items = get_json(client, '/wire/search?newsOnly=1')['_items']
    assert len(_items) == 3

    post_json(client, '/settings/general_settings', {'news_only_filter': 'type:text'})

    _items = get_json(client, '/wire/search?newsOnly=1')['_items']
    assert len(_items) == 0
