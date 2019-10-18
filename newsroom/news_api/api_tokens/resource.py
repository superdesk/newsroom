from content_api.tokens import CompanyTokenResource
from copy import deepcopy


class NewsApiTokensResource(CompanyTokenResource):
    internal_resource = True
    schema = deepcopy(CompanyTokenResource.schema)
    schema.update({'enabled': {'type': 'boolean', 'default': True}})
