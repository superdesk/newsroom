from flask import g, current_app as app
from newsroom.products import ProductsService, ProductsResource
from bson import ObjectId
import json


class NewsAPIProductsResource(ProductsResource):
    internal_resource = False
    query_objectid_as_string = True
    item_methods = ['GET']


class NewsAPIProductsService(ProductsService):

    # The subset of fields that are returned by the API
    allowed_fields = json.dumps({'_id': 1, 'name': 1, 'description': 1})

    def _prefix_hateoas(self, links):
        """Set the api and version prefix on the HATEOAS

        :param links:
        :return:
        """
        for (k, v) in links.items():
            if k == 'href':
                links[k] = app.config.get('URL_PREFIX') + v if v[0] == '/' else app.config.get('URL_PREFIX') + '/' + v
            elif isinstance(v, dict):
                self._prefix_hateoas(v)

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
        req.projection = self.allowed_fields
        lookup['companies'] = str(company_id)
        return super().get(req=req, lookup=lookup)

    def on_fetched(self, doc):
        self._prefix_hateoas(doc.get('_links', {}))
        for item in doc.get('_items', []):
            self._prefix_hateoas(item)

    def on_fetched_item(self, doc):
        self._prefix_hateoas(doc.get('_links', {}))
