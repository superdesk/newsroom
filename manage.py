import os
from app import Newsroom
from flask_script import Manager
import unittest
import coverage as cover


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


def run_unittests():
    basedir = os.path.abspath(os.path.dirname(__file__))
    tests = unittest.TestLoader().discover(start_dir=basedir, pattern='*tests.py')
    unittest.TextTestRunner(verbosity=2).run(tests)


if __name__ == "__main__":
    manager.run()
