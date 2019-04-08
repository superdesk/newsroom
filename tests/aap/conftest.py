import sys
from pathlib import Path
from pytest import fixture

from tests.conftest import update_config, client, setup  # noqa

root = (Path(__file__).parent / '..').resolve()
sys.path.insert(0, str(root))


@fixture
def app():
    from flask import Config
    from newsroom import Newsroom

    cfg = Config(root)
    cfg.from_object('newsroom.default_settings')
    cfg.from_object('tests.aap.settings')
    update_config(cfg)
    return Newsroom(config=cfg, testing=True)
