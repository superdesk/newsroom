import sys
from pathlib import Path
from pytest import fixture
from tests.conftest import update_config # noqa

root = (Path(__file__).parent / '..').resolve()
sys.path.insert(0, str(root))


@fixture
def app():
    from flask import Config
    from newsroom.news_api.app import NewsroomNewsAPI

    cfg = Config(root)
    cfg.from_object('newsroom.news_api.settings')
    update_config(cfg)
    return NewsroomNewsAPI(config=cfg, testing=True)
