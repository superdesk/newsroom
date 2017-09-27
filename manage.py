import os
from app import Newsroom
from flask_script import Manager
import unittest
import coverage as cover
from superdesk import get_resource_service


app = Newsroom()
manager = Manager(app)


@manager.command
def tests():
    """ Run the unit tests """
    run_unittests()


@manager.command
def coverage():
    """ Run the unit tests with coverage """
    cov = cover.coverage(branch=True,
                         omit=['env/*', 'newsroom_tests.py'])
    cov.start()

    run_unittests()

    cov.stop()
    print('Coverage Summary:')
    cov.report()
    cov.erase()


@manager.command
def create_user(email, password, name, is_admin):
    new_user = {
        'email': email,
        'password': password,
        'name': name,
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


def run_unittests():
    basedir = os.path.abspath(os.path.dirname(__file__))
    tests = unittest.TestLoader().discover(start_dir=basedir, pattern='*tests.py')
    unittest.TextTestRunner(verbosity=2).run(tests)


if __name__ == "__main__":
    manager.run()
