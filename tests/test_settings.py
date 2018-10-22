
from newsroom.settings import get_setting

from .test_users import test_login_succeeds_for_admin, init as admin_init  # noqa
from .utils import post_json


def test_general_settings(client, app):
    app.general_setting('foo', 'Foo', default='bar')
    test_login_succeeds_for_admin(client)
    assert 'bar' == get_setting('foo')
    post_json(client, '/settings/general_settings', {'foo': 'baz'})
    assert 'baz' == get_setting('foo')
    post_json(client, '/settings/general_settings', {'foo': ''})
    assert 'bar' == get_setting('foo')

    # without key returns all settings with metadata
    assert 'foo' in get_setting()
    assert 'Foo' == get_setting()['foo']['label']
    assert 'bar' == get_setting()['foo']['default']
