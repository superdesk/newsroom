from flask import request

from content_api.errors import BadParameterValueError

from newsroom.news_api.news.search_service import NewsAPINewsService


class NewsAPIFeedService(NewsAPINewsService):
    # set of parameters that the API will allow.
    allowed_params = {
        'start_date', 'end_date',
        'include_fields', 'exclude_fields',
        'max_results',
        'version', 'where',
        'q', 'default_operator', 'filter',
        'service', 'subject', 'genre', 'urgency',
        'priority', 'type', 'item_source', 'timezone', 'products',
        'exclude_ids'
    }

    default_sort = [{'versioncreated': 'asc'}]

    # set of fields that are allowed to be excluded in the exlude_fields parameter
    allowed_exclude_fields = {'version', 'firstcreated', 'headline', 'byline', 'slugline'}

    def prefill_search_query(self, search, req=None, lookup=None):
        """ Generate the search query instance

        :param newsroom.search.SearchQuery search: The search query instance
        :param eve.utils.ParsedRequest req: The parsed in request instance from the endpoint
        :param dict lookup: The parsed in lookup dictionary from the endpoint
        """

        super().prefill_search_query(search, req, lookup)

        if search.args.get('exclude_ids'):
            search.args['exclude_ids'] = search.args['exclude_ids'].split(',')

        try:
            search.args['max_results'] = int(search.args.get('max_results') or 25)
        except ValueError:
            raise BadParameterValueError('Max Results must be a number')

        search.args['size'] = search.args['max_results']

    def apply_filters(self, search):
        """ Generate and apply the different search filters

        :param newsroom.search.SearchQuery search: the search query instance
        """

        super().apply_filters(search)

        if search.args.get('exclude_ids'):
            search.query['bool']['must_not'].append({
                'terms': {'_id': search.args['exclude_ids']}
            })

    def on_fetched(self, doc):
        self._enhance_hateoas(doc)
        super().on_fetched(doc)

    def _enhance_hateoas(self, doc):
        doc.setdefault('_links', {})
        doc['_links']['parent'] = {
            'title': 'Home',
            'href': '/'
        }
        # Remove the next and last page references
        doc['_links'].pop('last', None)
        doc['_links'].pop('next', None)

        doc.setdefault('_meta', {})
        doc['_meta'].pop('page', None)

        self._hateoas_set_item_links(doc)
        self._hateoas_set_next_page_links(doc)

    def _hateoas_set_item_links(self, doc):
        for item in doc.get('_items') or []:
            doc_id = str(item['_id'])
            item.setdefault('_links', {})
            item['_links']['self'] = {
                'href': 'news/item/{}'.format(doc_id),
                'title': 'News Item'
            }
            item.pop('_updated', None)
            item.pop('_created', None)
            item.pop('_etag', None)

    def _hateoas_set_next_page_links(self, doc):
        args = request.args.to_dict()

        if doc['_meta']['total'] > 0:
            desc_items = list(reversed(doc.get('_items') or []))
            last_datetime = desc_items[0].get('versioncreated').strftime('%Y-%m-%dT%H:%M:%S')
            exclude_ids = []

            for item in desc_items:
                if item.get('versioncreated').strftime('%Y-%m-%dT%H:%M:%S') != last_datetime:
                    break

                exclude_ids.append(item.get('_id'))

            args['exclude_ids'] = ','.join(exclude_ids)
            args['start_date'] = last_datetime

            doc['_links']['next_page'] = {
                'title': 'News Feed',
                'href': '{}?{}'.format(
                    # request.path,
                    'news/feed',
                    '&'.join([
                        '{}={}'.format(key, args[key])
                        for key in sorted(args.keys())
                    ])
                )
            }
        else:
            doc['_links']['next_page'] = doc['_links']['self'] = {
                'title': 'News Feed',
                'href': '{}?{}'.format(
                    # request.path,
                    'news/feed',
                    '&'.join([
                        '{}={}'.format(key, args[key])
                        for key in sorted(args.keys())
                    ])
                )
            }
