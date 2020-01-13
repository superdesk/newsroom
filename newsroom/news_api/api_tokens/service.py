from content_api.tokens import CompanyTokenService
from content_api.errors import BadParameterValueError
from superdesk.utc import utcnow


class NewsApiTokensService(CompanyTokenService):

    def _validate(self, token):
        """
        Ensure that a no other tokens for the company exist. Ensure that the expiry date is in the future.
        :param token:
        :return:
        """
        company_tokens = self.find(where={'company': token.get('company')})
        if company_tokens.count() >= 1:
            raise BadParameterValueError('A token for the company exists already')

        if token.get('expiry'):
            if token.get('expiry') < utcnow():
                raise BadParameterValueError('Token has expired')

    def create(self, docs, **kwargs):
        for doc in docs:
            self._validate(doc)
        return super().create(docs, **kwargs)

    def on_update(self, updates, original):
        """
        Check that the updates are only for the expiry date and/or the enable flag nad rate limit keys
        :param updates:
        :param original:
        :return:
        """
        if not len(set(updates.keys()) - {'expiry', 'enabled', 'rate_limit_requests', 'rate_limit_expiry'}) == 0:
            raise Exception('Bad update request')

        return super().on_update(updates, original)

    def find_one(self, req, **lookup):
        """
        Used to lookup the token for the company, so swap the _id for token
        :param req:
        :param lookup:
        :return:
        """
        doc = super().find_one(req, **lookup)
        if doc:
            doc['token'] = doc.pop('_id')
        return doc
