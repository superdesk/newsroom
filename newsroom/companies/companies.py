
import newsroom
from content_api import MONGO_PREFIX


class CompaniesResource(newsroom.Resource):
    """
    Company schema
    """

    schema = {
        'name': {
            'type': 'string',
            'unique': True,
            'required': True
        },
        'url': {
            'type': 'string'
        },
        'sd_subscriber_id': {
            'type': 'string'
        },
        'is_enabled': {
            'type': 'boolean',
            'default': True
        },
        'contact_name': {
            'type': 'string'
        },
        'contact_email': {
            'type': 'string'
        },
        'phone': {
            'type': 'string'
        },
        'country': {
            'type': 'string'
        },
        'expiry_date': {
            'type': 'datetime',
            'nullable': True,
            'required': False,
        },
        'sections': {
            'type': 'objectid',
        },
        'archive_access': {
            'type': 'boolean',
        },
        'company_type': {
            'type': 'string',
            'nullable': True,
        },
        'events_only': {
            'type': 'boolean',
            'default': False,
        },
        'embedded': {
            'type': 'dict',
            'schema': {
                'video_display': {
                    'type': 'boolean',
                    'default': False,
                },
                'audio_display': {
                    'type': 'boolean',
                    'default': False,
                },
                'social_media_display': {
                    'type': 'boolean',
                    'default': False,
                },
                'images_display': {
                    'type': 'boolean',
                    'default': False,
                },
                'sdpermit_display': {
                    'type': 'boolean',
                    'default': False,
                },
                'all_display': {
                    'type': 'boolean',
                    'default': False,
                },
                'social_media_download': {
                    'type': 'boolean',
                    'default': False,
                },
                'video_download': {
                    'type': 'boolean',
                    'default': False,
                },
                'audio_download': {
                    'type': 'boolean',
                    'default': False,
                },
                'images_download': {
                    'type': 'boolean',
                    'default': False,
                },
                'sdpermit_download': {
                    'type': 'boolean',
                    'default': False,
                },
                'all_download': {
                    'type': 'boolean',
                    'default': False,
                }
            }
        },
        'account_manager': {
            'type': 'string'
        },
        'monitoring_administrator': {
            'type': 'objectid'
        },
        'allowed_ip_list': {
            'type': 'list',
            'mapping': {'type': 'string'}
        },
        'original_creator': newsroom.Resource.rel('users'),
        'version_creator': newsroom.Resource.rel('users'),
    }
    datasource = {
        'source': 'companies',
        'default_sort': [('name', 1)]
    }
    item_methods = ['GET', 'PATCH', 'DELETE']
    resource_methods = ['GET', 'POST']
    mongo_prefix = MONGO_PREFIX
    internal_resource = True


class CompaniesService(newsroom.Service):
    pass
