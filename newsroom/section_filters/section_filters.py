import newsroom
import superdesk
from newsroom.search import query_string


class SectionFiltersResource(newsroom.Resource):
    """
    Section Filters schema
    """
    schema = {
        'name': {
            'type': 'string',
            'unique': True,
            'required': True
        },
        'description': {
            'type': 'string'
        },
        'sd_product_id': {
            'type': 'string'
        },
        'query': {
            'type': 'string'
        },
        'is_enabled': {
            'type': 'boolean',
            'default': True
        },
        'filter_type': {
            'type': 'string',
            'default': 'wire'
        },
        'search_type': {
            'type': 'string',
            'default': 'wire'
        },
        'original_creator': newsroom.Resource.rel('users'),
        'version_creator': newsroom.Resource.rel('users'),
    }
    datasource = {
        'source': 'section_filters',
        'default_sort': [('name', 1)]
    }
    item_methods = ['GET', 'PATCH', 'DELETE']
    resource_methods = ['GET', 'POST']
    query_objectid_as_string = True  # needed for companies/navigations lookup to work


class SectionFiltersService(newsroom.Service):
    def get_section_filters(self, filter_type):
        """Get the list of section filter by filter type

        :param filter_type: Type of filter
        """
        lookup = {'is_enabled': True, 'filter_type': filter_type}
        section_filters = list(superdesk.get_resource_service('section_filters').get(req=None, lookup=lookup))
        return section_filters

    def get_section_filters_dict(self):
        """Get the list of all section filters

        """
        lookup = {'is_enabled': True}
        section_filters = list(superdesk.get_resource_service('section_filters').get(req=None, lookup=lookup))
        filters = {}
        for f in section_filters:
            if not filters.get(f.get('filter_type')):
                filters[f.get('filter_type')] = []
            filters[f.get('filter_type')].append(f)

        return filters

    def apply_section_filter(self, query, product_type, filters=None):
        """Get the list of base products for product type

        :param query: Dict of elasticsearch query
        :param product_type: Type of product
        :param filters: filters for each section
        """
        if not filters:
            section_filters = self.get_section_filters(product_type)
        else:
            section_filters = filters.get(product_type)

        if not section_filters:
            return

        for f in section_filters:
            if f.get('query'):
                query['bool']['must'].append(query_string(f.get('query')))
