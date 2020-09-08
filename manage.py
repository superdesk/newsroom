#!/usr/bin/env python

from flask_script import Manager

from superdesk import get_resource_service
from superdesk.commands.flush_elastic_index import FlushElasticIndex
from superdesk.commands.index_from_mongo import IndexFromMongo

from newsroom.web import NewsroomWebApp
from newsroom.mongo_utils import index_elastic_from_mongo, index_elastic_from_mongo_from_timestamp
from newsroom.auth import get_user_by_email
from newsroom.company_expiry_alerts import CompanyExpiryAlerts
from newsroom.monitoring .email_alerts import MonitoringEmailAlerts
from newsroom.data_updates import GenerateUpdate, Upgrade, get_data_updates_files, Downgrade

import content_api

app = NewsroomWebApp()
manager = Manager(app)


@manager.command
def create_user(email, password, first_name, last_name, is_admin):
    """Create a user with given email, password, first_name, last_name and is_admin flag.

    If user with given username exists it's noop.

    Example:
    ::

        $ python manage.py create_user admin@admin.com adminadmin admin admin True

    """

    new_user = {
        'email': email,
        'password': password,
        'first_name': first_name,
        'last_name': last_name,
        'user_type': 'administrator' if is_admin else 'public',
        'is_enabled': True,
        'is_approved': True
    }

    with app.test_request_context('/users', method='POST'):

        user = get_user_by_email(email)

        if user:
            print('user already exists %s' % str(new_user))
        else:
            print('creating user %s' % str(new_user))
            get_resource_service('users').post([new_user])
            print('user saved %s' % (new_user))

        return new_user


@manager.command
def elastic_rebuild():
    """
    It removes elastic index, creates a new one(s) and index it from mongo.

    Example:
    ::

        $ python manage.py elastic_rebuild

    """
    FlushElasticIndex().run(sd_index=True, capi_index=True)


@manager.command
def elastic_init():
    """Init elastic index.

    It will create index and put mapping. It should run only once so locks are in place.
    Thus mongo must be already setup before running this.

    Example:
    ::

        $ python manage.py elastic_init

    """
    app.data.init_elastic(app)


@manager.option('-h', '--hours', dest='hours', default=None)
@manager.option('-c', '--collection', dest='collection', default=None)
@manager.option('-t', '--timestamp', dest='timestamp', default=None)
@manager.option('-d', '--direction', dest='direction', choices=['older', 'newer'], default='older')
def index_from_mongo_period(hours, collection, timestamp, direction):
    """
    It allows to reindex up to a certain period.
    """
    print('Checking if elastic index exists, a new one will be created if not')
    app.data.init_elastic(app)
    print('Elastic index check has been completed')

    if timestamp:
        index_elastic_from_mongo_from_timestamp(collection, timestamp, direction)
    else:
        index_elastic_from_mongo(hours=hours, collection=collection)


@manager.option('--from', '-f', dest='collection_name')
@manager.option('--all', action='store_true', dest='all_collections')
@manager.option('--page-size', '-p', default=500)
def index_from_mongo(collection_name, all_collections, page_size):
    """Index the specified mongo collection in the specified elastic collection/type.

    This will use the default APP mongo DB to read the data and the default Elastic APP index.

    Use ``-f all`` to index all collections.

    Example:
    ::

        $ python manage.py index_from_mongo --from=items
        $ python manage.py index_from_mongo --all

    """
    IndexFromMongo().run(collection_name, all_collections, page_size)


@manager.command
def content_reset():
    """Removes all data from 'items' and 'items_versions' indexes/collections.

    Example:
    ::

        $ python manage.py content_reset

    """
    app.data.remove('items')
    app.data.remove('items_versions')


@manager.command
def send_company_expiry_alerts():
    """
    Send expiry alerts for companies which are close to be expired (now + 7 days)

    Example:
    ::

        $ python manage.py content_reset

    """
    CompanyExpiryAlerts().send_alerts()


@manager.command
def send_monitoring_schedule_alerts():
    """
    Send monitoring schedule alerts.

    Example:
    ::

        $ python manage.py send_monitoring_schedule_alerts

    """
    MonitoringEmailAlerts().run()


@manager.command
def send_monitoring_immediate_alerts():
    """
    Send monitoring immediate alerts.

    Example:
    ::

        $ python manage.py send_monitoring_immediate_alerts

    """
    MonitoringEmailAlerts().run(True)


@manager.option('-m', '--expiry', dest='expiry_days', required=False)
def remove_expired(expiry_days):
    """Remove expired items from the content_api items collection.

    By default no items expire there, you can change it using ``CONTENT_API_EXPIRY_DAYS`` config.

    Example:
    ::

        $ python manage.py remove_expired

    """
    exp = content_api.RemoveExpiredItems()
    exp.run(expiry_days)


@manager.option('-r', '--resource', dest='resource', required=True)
def data_generate_update(resource):
    cmd = GenerateUpdate()
    cmd.run(resource)


@manager.option(
    '-i', '--id', dest='data_update_id',
    required=False, choices=get_data_updates_files(strip_file_extension=True),
    help='Data update id to run last'
)
@manager.option(
    '-f', '--fake-init', dest='fake',
    required=False, action='store_true',
    help='Mark data updates as run without actually running them'
)
@manager.option(
    '-d', '--dry-run', dest='dry',
    required=False, action='store_true',
    help='Does not mark data updates as done. This can be useful for development.'
)
def data_upgrade(data_update_id=None, fake=False, dry=False):
    cmd = Upgrade()
    cmd.run(data_update_id, fake, dry)


@manager.option(
    '-i', '--id', dest='data_update_id',
    required=False, choices=get_data_updates_files(strip_file_extension=True),
    help='Data update id to run last'
)
@manager.option(
    '-f', '--fake-init', dest='fake',
    required=False, action='store_true',
    help='Mark data updates as run without actually running them'
)
@manager.option(
    '-d', '--dry-run', dest='dry',
    required=False, action='store_true',
    help='Does not mark data updates as done. This can be useful for development.'
)
def data_downgrade(data_update_id=None, fake=False, dry=False):
    cmd = Downgrade()
    cmd.run(data_update_id, fake, dry)


if __name__ == "__main__":
    manager.run()
