from setuptools import setup, find_packages

install_requires = [
    'Babel>=2.5.3,<3.0',
    'WTForms==2.2.1',
    'flask-webpack>=0.1.0,<0.2',
    'Flask-WTF>=0.14.2,<0.15',
    'flask-limiter>=0.9.5.1,<0.9.6',
    'Flask-Cache>=0.13.1,<0.14',
    'honcho>=1.0.1',
    'gunicorn>=19.7.1',
    'PyRTF3>=0.47.5',
    'reportlab==3.5.53',
    'email-validator==1.0.5',
    'urllib3<1.26',
    'xhtml2pdf>=0.2.4',
    'werkzeug>=0.9.4,<=0.11.15',
]

setup(
    name='Newsroom',
    version='1.0',
    description='Newsroom app',
    author='Sourcefabric',
    url='https://github.com/superdesk/newsroom',
    license='GPLv3',
    platforms=['any'],
    packages=find_packages(exclude=['tests']),
    include_package_data=True,
    install_requires=install_requires,
    dependency_links=[],
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
    ],
)
