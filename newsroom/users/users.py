import bcrypt
from flask import current_app as app

import newsroom
from content_api import MONGO_PREFIX
from superdesk.utils import is_hashed, get_hash


class UsersResource(newsroom.Resource):
    """
    Users schema
    """

    schema = {
        'password': {
            'type': 'string',
            'minlength': 8
        },
        'first_name': {
            'type': 'string'
        },
        'last_name': {
            'type': 'string'
        },
        'email': {
            'unique': True,
            'type': 'string',
            'required': True
        },
        'phone': {
            'type': 'string',
            'nullable': True
        },
        'mobile': {
            'type': 'string',
            'nullable': True
        },
        'role': {
            'type': 'string',
            'nullable': True
        },
        'signup_details': {
            'type': 'dict'
        },
        'country': {
            'type': 'string'
        },
        'company': newsroom.Resource.rel('companies', embeddable=True, required=False),
        'user_type': {
            'type': 'string',
            'allowed': ['administrator', 'internal', 'public'],
            'default': 'public'
        },
        'is_validated': {
            'type': 'boolean',
            'default': False
        },
        'is_enabled': {
            'type': 'boolean',
            'default': True
        },
        'is_approved': {
            'type': 'boolean',
            'default': False
        },
        'token': {
            'type': 'string',
        },
        'token_expiry_date': {
            'type': 'datetime',
        },
        'receive_email': {
            'type': 'boolean',
            'default': False
        }
    }

    item_methods = ['GET', 'PATCH', 'PUT']
    resource_methods = ['GET', 'POST']
    mongo_prefix = MONGO_PREFIX
    datasource = {
        'source': 'users',
        'projection': {'password': 0},
        'default_sort': [('name', 1)]
    }
    mongo_indexes = {
        'email': ([('email', 1)], {'unique': True})
    }


class UsersService(newsroom.Service):
    """
    A service that knows how to perform CRUD operations on the `users`
    collection.

    Serves mainly as a proxy to the data layer.
    """

    def on_create(self, docs):
        super().on_create(docs)
        for doc in docs:
            if doc.get('password', None) and not is_hashed(doc.get('password')):
                doc['password'] = self._get_password_hash(doc['password'])

    def on_update(self, updates, original):
        if 'password' in updates:
            updates['password'] = self._get_password_hash(updates['password'])

    def _get_password_hash(self, password):
        return get_hash(password, app.config.get('BCRYPT_GENSALT_WORK_FACTOR', 12))

    def password_match(self, password, hashed_password):
        """Return true if the given password matches the hashed password
        :param password: plain password
        :param hashed_password: hashed password
        """
        try:
            return hashed_password == bcrypt.hashpw(password, hashed_password)
        except Exception:
            return False
