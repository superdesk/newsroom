#!/usr/bin/env python

from flask_script import Manager
from newsroom import Newsroom
from superdesk import get_resource_service
from newsroom.elastic_utils import rebuild_elastic_index


app = Newsroom()
manager = Manager(app)


@manager.command
def create_user(email, password, first_name, last_name, is_admin):
    new_user = {
        'email': email,
        'password': password,
        'first_name': first_name,
        'last_name': last_name,
        'email': email,
        'user_type': 'administrator' if is_admin else 'public',
        'is_enabled': True,
        'is_approved': True
    }

    with app.test_request_context('/users', method='POST'):

        user = get_resource_service('users').find_one(email=email, req=None)

        if user:
            print('user already exists %s' % str(new_user))
        else:
            print('creating user %s' % str(new_user))
            get_resource_service('users').post([new_user])
            print('user saved %s' % (new_user))

        return new_user


@manager.command
def elastic_rebuild():
    rebuild_elastic_index()


@manager.command
def elastic_init():
    app.data.init_elastic(app)


@manager.command
def content_reset():
    app.data.remove('items')
    app.data.remove('items_versions')


if __name__ == "__main__":
    manager.run()
