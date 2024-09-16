from content_api.errors import BadParameterValueError
from newsroom.news_api.news.search_service import NewsAPINewsService
from superdesk import get_resource_service
from lxml import etree
from lxml.etree import SubElement
from superdesk.utc import utcnow
from flask import current_app as app, g, Response, url_for
import logging
from newsroom.news_api.utils import check_featuremedia_association_permission, update_embed_urls
from newsroom.wire.formatters.utils import remove_unpermissioned_embeds
from datetime import timedelta
from email import utils


class NewsAPISyndicateService(NewsAPINewsService):
    allowed_params = {
        'start_date', 'end_date',
        'include_fields', 'exclude_fields',
        'max_results', 'page_size', 'page', 'timezone',
        'version', 'where', 'item_source',
        'q', 'default_operator', 'filter',
        'service', 'subject', 'genre', 'urgency',
        'priority', 'type', 'item_source', 'timezone', 'products',
        'exclude_ids', 'formatter', 'sort'
    }
    default_sort = [{'versioncreated': 'asc'}]

    allowed_exclude_fields = {'version', 'firstcreated', 'headline', 'byline', 'slugline'}

    def on_fetched(self, doc):
        self._enhance_hateoas(doc)
        super().on_fetched(doc)

    def _enhance_hateoas(self, doc):
        doc.setdefault('_links', {})
        doc['_links']['parent'] = {
            'title': 'Home',
            'href': '/'
        },
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

    def prefill_search_query(self, search, req=None, lookup=None):
        super().prefill_search_query(search, req, lookup)

        if search.args.get('exclude_ids'):
            search.args['exclude_ids'] = search.args['exclude_ids'].split(',')

        try:
            search.args['max_results'] = int(search.args.get('max_results') or 200)
        except ValueError:
            raise BadParameterValueError('Max Results must be a number')

        search.args['size'] = search.args['max_results']

    @staticmethod
    def _format_date(date):
        iso8601 = date.isoformat()
        if date.tzinfo:
            return iso8601
        return iso8601 + 'Z'

    @staticmethod
    def _format_update_date(date):
        DATETIME_FORMAT = "%Y-%m-%dT%H:%M:%S"
        return date.strftime(DATETIME_FORMAT) + 'Z'

    @staticmethod
    def _format_date_publish(date):
        return utils.format_datetime(date)

    @staticmethod
    def generate_atom_feed(response, token=None):
        XML_ROOT = '<?xml version="1.0" encoding="UTF-8"?>'
        _message_nsmap = {None: 'http://www.w3.org/2005/Atom', 'dcterms': 'http://purl.org/dc/terms/',
                          'media': 'http://search.yahoo.com/mrss/',
                          'mi': 'http://schemas.ingestion.microsoft.com/common/'}

        feed = etree.Element('feed', nsmap=_message_nsmap)
        SubElement(feed, 'title').text = etree.CDATA('{} Atom Feed'.format(app.config['SITE_NAME']))
        SubElement(feed, 'updated').text = __class__._format_update_date(utcnow())
        SubElement(SubElement(feed, 'author'), 'name').text = app.config['SITE_NAME']
        feed_url = url_for('syndicate.get_syndicate_feed',
                           syndicate_type='syndicate',
                           _external=True,
                           formatter='atom')

        SubElement(feed, 'id').text = feed_url
        SubElement(feed, 'link',
                   attrib={'href': feed_url, 'rel': 'self'})
        item_resource = get_resource_service('items')
        image = None
        for item in response['_items']:
            try:
                complete_item = item_resource.find_one(req=None, _id=item.get('_id'))
                # If featuremedia is not allowed for the company don't add the item
                if ((complete_item.get('associations') or {}).get('featuremedia') or {}).get('renditions'):
                    if not check_featuremedia_association_permission(complete_item):
                        continue
                remove_unpermissioned_embeds(complete_item, g.user, 'news_api')
                entry = SubElement(feed, 'entry')
                # If the item has any parents we use the id of the first, this should be constant throught the update
                # history
                if complete_item.get('ancestors') and len(complete_item.get('ancestors')):
                    SubElement(entry, 'id').text = complete_item.get('ancestors')[0]
                else:
                    SubElement(entry, 'id').text = complete_item.get('_id')

                SubElement(entry, 'title').text = etree.CDATA(complete_item.get('headline'))
                SubElement(entry, 'published').text = __class__._format_date(complete_item.get('firstpublished'))
                SubElement(entry, 'updated').text = __class__._format_update_date(complete_item.get('versioncreated'))
                if token:
                    SubElement(entry, 'link', attrib={'rel': 'self', 'href': url_for('news/item.get_item',
                                                                                     item_id=item.get('_id'),
                                                                                     format='TextFormatter',
                                                                                     token=token,
                                                                                     _external=True)})
                else:
                    SubElement(entry, 'link', attrib={'rel': 'self', 'href': url_for('news/item.get_item',
                                                                                     item_id=item.get('_id'),
                                                                                     format='TextFormatter',
                                                                                     _external=True)})

                if complete_item.get('byline'):
                    name = complete_item.get('byline')
                    if complete_item.get('source') and not app.config['COPYRIGHT_HOLDER'].lower() == complete_item.get(
                            'source', '').lower():
                        name = name + " - " + complete_item.get('source')
                    SubElement(SubElement(entry, 'author'), 'name').text = name
                else:
                    SubElement(SubElement(entry, 'author'), 'name').text = complete_item.get(
                        'source') if complete_item.get(
                        'source') else app.config['COPYRIGHT_HOLDER']

                SubElement(entry, 'rights').text = complete_item.get('source', '')

                if complete_item.get('pubstatus') == 'usable':
                    SubElement(entry, etree.QName(_message_nsmap.get('dcterms'), 'valid')).text = \
                        'start={}; end={}; scheme=W3C-DTF'.format(__class__._format_date(utcnow()),
                                                                  __class__._format_date(utcnow() + timedelta(days=30)))
                else:
                    SubElement(entry, etree.QName(_message_nsmap.get('dcterms'), 'valid')).text = \
                        'start={}; end={}; scheme=W3C-DTF'.format(__class__._format_date(utcnow()),
                                                                  __class__._format_date(utcnow() - timedelta(days=30)))

                categories = [{'name': s.get('name')} for s in complete_item.get('service', [])]
                for category in categories:
                    SubElement(entry, 'category', attrib={'term': category.get('name')})

                SubElement(entry, 'summary').text = etree.CDATA(complete_item.get('description_text', ''))
                update_embed_urls(complete_item, token)
                SubElement(entry, 'content', attrib={'type': 'html'}).text = etree.CDATA(
                    complete_item.get('body_html', ''))
                if ((complete_item.get('associations') or {}).get('featuremedia') or {}).get('renditions'):
                    image = ((complete_item.get('associations') or {}).get('featuremedia') or {}).get('renditions').get(
                        "16-9")
                    if image:
                        metadata = ((complete_item.get('associations') or {}).get('featuremedia') or {})

                        url = url_for('assets.get_item', _external=True, asset_id=image.get('media'),
                                      token=token) if token else url_for(
                            'assets.get_item', _external=True, asset_id=image.get('media'))

                        media = SubElement(entry, etree.QName(_message_nsmap.get('media'), 'content'),
                                           attrib={'url': url, 'type': image.get('mimetype'), 'medium': 'image'})

                        SubElement(media, etree.QName(_message_nsmap.get('media'), 'credit')).text = metadata.get(
                            'byline')
                        SubElement(media, etree.QName(_message_nsmap.get('media'), 'title')).text = metadata.get(
                            'description_text')
                        SubElement(media, etree.QName(_message_nsmap.get('media'), 'text')).text = metadata.get(
                            'body_text')
                        if image.get('poi'):
                            focr = SubElement(media, etree.QName(_message_nsmap.get('mi'), 'focalRegion'))
                            SubElement(focr, etree.QName(_message_nsmap.get('mi'), 'x1')).text = str(
                                image.get('poi').get('x'))
                            SubElement(focr, etree.QName(_message_nsmap.get('mi'), 'x2')).text = str(
                                image.get('poi').get('x'))
                            SubElement(focr, etree.QName(_message_nsmap.get('mi'), 'y1')).text = str(
                                image.get('poi').get('y'))
                            SubElement(focr, etree.QName(_message_nsmap.get('mi'), 'y2')).text = str(
                                image.get('poi').get('y'))
            except Exception as ex:
                __class__.handle_exception(item, ex)
                continue
        return Response(XML_ROOT + etree.tostring(feed, method='xml', pretty_print=True).decode('utf-8'),
                        mimetype='application/atom+xml')

    @staticmethod
    def generate_rss_feed(response, token=None):
        XML_ROOT = '<?xml version="1.0" encoding="UTF-8"?>'

        _message_nsmap = {'dcterms': 'http://purl.org/dc/terms/', 'media': 'http://search.yahoo.com/mrss/',
                          'dc': 'http://purl.org/dc/elements/1.1/',
                          'mi': 'http://schemas.ingestion.microsoft.com/common/',
                          'content': 'http://purl.org/rss/1.0/modules/content/'}

        feed = etree.Element('rss', attrib={'version': '2.0'}, nsmap=_message_nsmap)
        channel = SubElement(feed, 'channel')
        SubElement(channel, 'title').text = '{} RSS Feed'.format(app.config['SITE_NAME'])
        SubElement(channel, 'description').text = '{} RSS Feed'.format(app.config['SITE_NAME'])
        feed_url = url_for('syndicate.get_syndicate_feed',
                           syndicate_type='syndicate',
                           _external=True,
                           formatter='rss')
        SubElement(channel, 'link').text = feed_url
        item_resource = get_resource_service('items')
        image = None
        for item in response['_items']:
            try:
                complete_item = item_resource.find_one(req=None, _id=item.get('_id'))

                if ((complete_item.get('associations') or {}).get('featuremedia') or {}).get('renditions'):
                    if not check_featuremedia_association_permission(complete_item):
                        continue
                remove_unpermissioned_embeds(complete_item, g.user, 'news_api')

                entry = SubElement(channel, 'item')
                if complete_item.get('ancestors') and len(complete_item.get('ancestors')):
                    SubElement(entry, 'guid').text = complete_item.get('ancestors')[0]
                else:
                    SubElement(entry, 'guid').text = complete_item.get('_id')

                SubElement(entry, 'title').text = etree.CDATA(complete_item.get('headline'))
                SubElement(entry, 'pubDate').text = __class__._format_date_publish(complete_item.get('firstpublished'))
                SubElement(entry,
                           etree.QName(_message_nsmap.get('dcterms'), 'modified')).text = __class__._format_update_date(
                    complete_item.get('versioncreated'))
                if token:
                    SubElement(entry, 'link').text = url_for('news/item.get_item',
                                                             item_id=item.get('_id'),
                                                             format='TextFormatter',
                                                             token=token,
                                                             _external=True)
                else:
                    SubElement(entry, 'link').text = url_for('news/item.get_item',
                                                             item_id=item.get('_id'),
                                                             format='TextFormatter',
                                                             _external=True)

                if complete_item.get('byline'):
                    name = complete_item.get('byline')
                    if complete_item.get('source') and not app.config[
                            'COPYRIGHT_HOLDER'].lower() == complete_item.get(
                            'source', '').lower():
                        name = name + " - " + complete_item.get('source')
                    SubElement(entry, etree.QName(_message_nsmap.get('dc'), 'creator')).text = name
                else:
                    SubElement(entry, etree.QName(_message_nsmap.get('dc'), 'creator')).text = \
                        complete_item.get('source') if complete_item.get('source') else app.config[
                            'COPYRIGHT_HOLDER']

                SubElement(entry, 'source',
                           attrib={'url': feed_url}).text = \
                    complete_item.get('source', '')

                if complete_item.get('pubstatus') == 'usable':
                    SubElement(entry, etree.QName(_message_nsmap.get('dcterms'), 'valid')).text = \
                        'start={}; end={}; scheme=W3C-DTF'.format(__class__._format_date_publish(
                            complete_item.get('firstpublished')),
                            __class__._format_date(
                                utcnow() + timedelta(days=30)))
                else:
                    # in effect a kill set the end date into the past
                    SubElement(entry, etree.QName(_message_nsmap.get('dcterms'), 'valid')).text = \
                        'start={}; end={}; scheme=W3C-DTF'.format(__class__._format_date(utcnow()),
                                                                  __class__._format_date(
                                                                      utcnow() - timedelta(days=30)))

                categories = [{'name': s.get('name')} for s in complete_item.get('service', [])] \
                    + [{'name': s.get('name')} for s in complete_item.get('subject', [])] \
                    + [{'name': s.get('name')} for s in complete_item.get('place', [])] \
                    + [{'name': k} for k in complete_item.get('keywords', [])]
                for category in categories:
                    SubElement(entry, 'category').text = category.get('name')

                SubElement(entry, 'description').text = etree.CDATA(complete_item.get('description_text', ''))

                update_embed_urls(complete_item, token)

                SubElement(entry, etree.QName(_message_nsmap.get('content'), 'encoded')).text = etree.CDATA(
                    complete_item.get('body_html', ''))

                if ((complete_item.get('associations') or {}).get('featuremedia') or {}).get('renditions'):
                    image = ((complete_item.get('associations') or {}).get('featuremedia') or {}).get(
                        'renditions').get(
                        "16-9")
                if image:
                    metadata = ((complete_item.get('associations') or {}).get('featuremedia') or {})

                    url = url_for('assets.get_item', _external=True, asset_id=image.get('media'),
                                  token=token) if token else url_for(
                        'assets.get_item', _external=True, asset_id=image.get('media'))

                    media = SubElement(entry, etree.QName(_message_nsmap.get('media'), 'content'),
                                       attrib={'url': url, 'type': image.get('mimetype'), 'medium': 'image'})

                    SubElement(media, etree.QName(_message_nsmap.get('media'), 'credit')).text = metadata.get(
                        'byline')
                    SubElement(media, etree.QName(_message_nsmap.get('media'), 'title')).text = metadata.get(
                        'description_text')
                    SubElement(media, etree.QName(_message_nsmap.get('media'), 'text')).text = metadata.get(
                        'body_text')
                    if image.get('poi'):
                        focr = SubElement(media, etree.QName(_message_nsmap.get('mi'), 'focalRegion'))
                        SubElement(focr, etree.QName(_message_nsmap.get('mi'), 'x1')).text = str(
                            image.get('poi').get('x'))
                        SubElement(focr, etree.QName(_message_nsmap.get('mi'), 'x2')).text = str(
                            image.get('poi').get('x'))
                        SubElement(focr, etree.QName(_message_nsmap.get('mi'), 'y1')).text = str(
                            image.get('poi').get('y'))
                        SubElement(focr, etree.QName(_message_nsmap.get('mi'), 'y2')).text = str(
                            image.get('poi').get('y'))
            except Exception as ex:
                __class__.handle_exception(item, ex)
                continue
        return Response(XML_ROOT + etree.tostring(feed, method='xml', pretty_print=True).decode('utf-8'),
                        mimetype='application/rss+xml')

    @staticmethod
    def handle_exception(item, ex):
        item_id = item.get('_id')
        log_message = f"Processing {item_id} - {str(ex)}"
        logging.exception(log_message)
