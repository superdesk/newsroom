from setuptools import setup, find_packages

install_requires = [
    'eve==0.7.8',
    'flask-babel>=0.11.2,<0.12',
    'flask-webpack>=0.1.0,<0.2',
    'Flask-WTF>=0.14.2,<0.15',
    'flask-limiter>=0.9.5.1,<0.9.6',
    'Flask-Cache>=0.13.1,<0.14',
    'honcho>=1.0.1',
    'gunicorn>=19.7.1',
    'superdesk-core>=1.15.1,<1.16',
]

setup(
    name='Newsroom',
    version='0.1',
    description='Newsroom client app',
    author='Sourcefabric',
    url='https://github.com/superdesk/newsroom',
    license='GPLv3',
    platforms=['any'],
    packages=find_packages(exclude=['tests']),
    include_package_data=True,
    install_requires=install_requires,
    scripts=['manage.py'],
    classifiers=[
        'Development Status :: 4 - Beta',
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: GNU General Public License v3 (GPLv3)',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
    ]
)
