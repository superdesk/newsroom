import sys
from pathlib import Path

from pytest import fixture
from flask import Config

from newsroom.web import NewsroomWebApp
from tests.conftest import update_config, client, clean_databases  # noqa


root = (Path(__file__).parent / '..').resolve()
sys.path.insert(0, str(root))


@fixture
def app(request):
    cfg = Config(root)
    cfg.from_object('newsroom.default_settings')
    update_config(cfg)
    app = NewsroomWebApp(config=cfg, testing=True)

    # init elastic
    with app.app_context():
        app.data.init_elastic(app)

    def teardown():
        # drop mongo db and es index
        with app.app_context():
            clean_databases(app)

    request.addfinalizer(teardown)

    with app.app_context():
        yield app

