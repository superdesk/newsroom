from content_api.tokens import CompanyTokenResource
from copy import deepcopy


class NewsApiTokensResource(CompanyTokenResource):
    schema = deepcopy(CompanyTokenResource.schema)
    schema.update({'enabled': {'type': 'boolean', 'default': True}})
