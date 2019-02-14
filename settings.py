import os

SITE_NAME = 'ANSA Newsroom'
COPYRIGHT_HOLDER = 'ANSA'

WATERMARK_IMAGE = os.path.join(os.path.dirname(__file__), 'theme', 'watermark.png')

ANSA_VFS = os.environ.get('ANSA_VFS', 'http://172.20.14.95:8080')

INSTALLED_APPS = [
    'ansa.vfs',
]
