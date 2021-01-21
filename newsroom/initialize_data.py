import logging
from pathlib import Path
from collections import OrderedDict

from apps.prepopulate.app_initialize import AppInitializeWithDataCommand as _AppInitializeWithDataCommand
from newsroom.web import NewsroomWebApp


logger = logging.getLogger(__name__)
app = NewsroomWebApp()
DATA_PATH = Path(__file__).parent.parent / 'data'
__entities__ = OrderedDict([
    ('users', ('users.json', [], False)),
    ('ui_config', ('ui_config.json', [], True)),
])


class AppInitializeWithDataCommand(_AppInitializeWithDataCommand):

    def run(self, entity_name=None, force=False, init_index_only=False):
        logger.info('Starting data initialization')

        # create indexes in mongo
        app.init_indexes()
        # put mapping to elastic
        app.data.init_elastic(app)

        if init_index_only:
            logger.info('Only indexes initialized.')
            return 0

        if entity_name:
            if isinstance(entity_name, str):
                entity_name = [entity_name]
            for name in entity_name:
                (file_name, index_params, do_patch) = __entities__[name]
                self.import_file(name, DATA_PATH, file_name, index_params, do_patch, force)
            return 0

        for name, (file_name, index_params, do_patch) in __entities__.items():
            try:
                self.import_file(name, DATA_PATH, file_name, index_params, do_patch, force)
            except KeyError:
                continue
            except Exception as ex:
                logger.exception(ex)
                logger.info('Exception loading entity {} from {}'.format(name, file_name))

        logger.info('Data import finished')
        return 0
