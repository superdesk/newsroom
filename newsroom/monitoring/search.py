import logging
from flask import abort
from flask_babel import gettext

from superdesk import get_resource_service
from newsroom.search import query_string
from newsroom.wire.search import WireSearchResource, WireSearchService
from newsroom.utils import query_resource
from newsroom.products.products import get_products_by_company

logger = logging.getLogger(__name__)


class MonitoringSearchResource(WireSearchResource):
    pass


class MonitoringSearchService(WireSearchService):
    section = 'monitoring'

    def prefill_search_user(self, search):
        """ Prefill the search user

        :param SearchQuery search: The search query instance
        """

        if search.args.get('skip_user_validation'):
            search.user = None
            return

        return super().prefill_search_user(search)

    def prefill_search_section(self, search):
        """ Prefill the search section

        :param SearchQuery search: The search query instance
        """

        search.section = 'wire'

    def prefill_search_products(self, search):
        """ Prefill the search products

        :param SearchQuery search: The search query instance
        """

        if search.company:
            search.products = get_products_by_company(
                search.company.get('_id'),
                search.navigation_ids,
                product_type=search.section
            )
        else:
            search.products = []

    def validate_request(self, search):
        """ Validate the request parameters

        :param SearchQuery search: The search query instance
        """

        if not search.is_admin:
            if search.args.get('requested_products'):
                # Ensure that all the provided products are permissioned for this request
                if not all(p in [c.get('_id') for c in search.products] for p in search.args['requested_products']):
                    abort(404, gettext('Invalid product parameter'))

    def apply_products_filter(self, search):
        """ Generate the product filters

        :param newsroom.wire.service.SearchQuery search: the search query instance
        """

        monitoring_list = []

        if search.req:
            if len(search.navigation_ids) > 0:
                monitoring_list.append(get_resource_service('monitoring').find_one(
                    req=None,
                    _id=search.navigation_ids[0])
                )
            else:
                abort(403, gettext('No monitoring profile requested.'))
        else:
            monitoring_list = list(query_resource('monitoring'))

        if len(monitoring_list) < 1:
            return

        for mlist in monitoring_list:
            search.query['bool']['should'].append(
                query_string(mlist['query'])
            )

        if search.navigation_ids and len(monitoring_list[0].get('keywords') or []) > 0 and search.source is not None:
            search.source['highlight'] = {'fields': {}}
            fields = ['body_html']
            for field in fields:
                search.source['highlight']['fields'][field] = {
                    "number_of_fragments": 0,
                    "highlight_query": {
                        "query_string": {
                            "query": ' '.join(monitoring_list[0]['keywords']),
                            "default_operator": "AND",
                            "lenient": False
                        }
                    }
                }
            search.source['highlight']['pre_tags'] = ["<span class='es-highlight'>"]
            search.source['highlight']['post_tags'] = ["</span>"]
            search.source['highlight']['require_field_match'] = False
