from newsroom.news_api.news.search_service import NewsAPINewsService


class NewsAPISearchService(NewsAPINewsService):
    def on_fetched(self, doc):
        self._enhance_hateoas(doc)
        super().on_fetched(doc)

    def _enhance_hateoas(self, doc):
        doc.setdefault('_links', {})
        doc['_links']['parent'] = {
            'title': 'Home',
            'href': '/'
        }
        self._hateoas_set_item_links(doc)

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
