from flask import g
from newsroom.products import ProductsService, ProductsResource
from bson import ObjectId
import json
from eve.utils import ParsedRequest
from newsroom.news_api.utils import post_api_audit


class NewsAPIProductsResource(ProductsResource):
    internal_resource = False
    query_objectid_as_string = True
    item_methods = ['GET']
    resource_title = 'Account Products'


class NewsAPIProductsService(ProductsService):

    # The subset of fields that are returned by the API
    allowed_fields = json.dumps({'_id': 1, 'name': 1, 'description': 1})

    def find_one(self, req, **lookup):
        req.projection = self.allowed_fields
        if '_id' in lookup and isinstance(lookup['_id'], str):
            lookup['_id'] = ObjectId(lookup.get('_id'))
        lookup['companies'] = str(g.user)
        item = super().find_one(req, **lookup)
        return item

    def get(self, req, lookup):
        # Get the identity of the company
        company_id = g.user
        if not req:
            req = ParsedRequest()
        req.projection = self.allowed_fields
        lookup['companies'] = str(company_id)
        lookup['product_type'] = 'news_api'
        return super().get(req=req, lookup=lookup)

    def on_fetched(self, doc):
        post_api_audit(doc)

    def on_fetched_item(self, doc):
        post_api_audit(doc)
