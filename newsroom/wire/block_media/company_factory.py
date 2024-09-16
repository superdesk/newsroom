import time
from flask import session, g
from superdesk import get_resource_service


class CompanyFactory:
    _company_cache = {}
    _cache_expiration_time = 30

    @staticmethod
    def get_user_company(user):
        current_time = time.time()
        if not user.get('company'):
            return []
        if user and user.get('company') in CompanyFactory._company_cache:
            cached_data = CompanyFactory._company_cache[user['company']]
            if current_time - cached_data['timestamp'] < CompanyFactory._cache_expiration_time:
                return cached_data['company']

        company = get_resource_service('companies').find_one(req=None, _id=user['company'])
        if company:
            CompanyFactory._company_cache[user['company']] = {
                'company': company,
                'timestamp': current_time
            }
            CompanyFactory._update_embedded_data_in_session(user, company)
            return company

        company = get_resource_service('companies').find_one(req=None, _id=g.user) if hasattr(g, 'user') else None
        if company:
            CompanyFactory._company_cache[g.user] = {
                'company': company,
                'timestamp': current_time
            }
            CompanyFactory._update_embedded_data_in_session(g.user, company)
        return company

    @staticmethod
    def get_embedded_data(user):
        company = CompanyFactory.get_user_company(user)
        if not company:
            return {
                "embedded": {
                    "social_media_display": False,
                    "video_display": False,
                    "audio_display": False,
                    "images_display": False,
                    "all_display": True,
                    "social_media_download": False,
                    "video_download": False,
                    "audio_download": False,
                    "images_download": False,
                    "all_download": False,
                    "sdpermit_display": False,
                    "sdpermit_download": False
                }
            }

        embedded = session.get(f"embedded_data_{user['company']}", {})

        if embedded != company.get("embedded", {}):
            CompanyFactory._update_embedded_data_in_session(user, company)
            embedded = company.get("embedded", {})

        return embedded

    @staticmethod
    def _update_embedded_data_in_session(user, company):
        session[f"embedded_data_{user['company']}"] = company.get("embedded", {
            "social_media_display": False,
            "video_display": False,
            "audio_display": False,
            "images_display": False,
            "all_display": True,
            "social_media_download": False,
            "video_download": False,
            "audio_download": False,
            "images_download": False,
            "all_download": False,
            "sdpermit_display": False,
            "sdpermit_download": False
        })
        session.permanent = False
        session.modified = True
