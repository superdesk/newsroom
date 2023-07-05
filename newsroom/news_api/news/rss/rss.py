import superdesk
import flask
from eve.methods.get import get_internal
from lxml import etree,  html as lxml_html
from lxml.etree import SubElement
from superdesk.utc import utcnow
from superdesk.etree import to_string
from flask import current_app as app, g
from email import utils
import datetime
import logging
import re
from newsroom.news_api.utils import check_association_permission
from newsroom.wire.formatters.utils import remove_unpermissioned_embeds

blueprint = superdesk.Blueprint('rss', __name__)


logger = logging.getLogger(__name__)


def init_app(app):
    superdesk.blueprint(blueprint, app)


@blueprint.route('/rss', methods=['GET'])
@blueprint.route('/rss/<path:token>', methods=['GET'])
def get_rss(token=None):

    def _format_date(date):
        iso8601 = date.isoformat()
        if date.tzinfo:
            return iso8601
        return iso8601 + 'Z'

    def _format_date_2(date):
        DATETIME_FORMAT = "%Y-%m-%dT%H:%M:%S"
        return date.strftime(DATETIME_FORMAT) + 'Z'

    def _format_date_3(date):
        return utils.format_datetime(date)

    auth = app.auth
    if not auth.authorized([], None, flask.request.method):
        if token:
            if not auth.check_auth(token, allowed_roles=None, resource=None, method='GET'):
                return auth.authenticate()
        else:
            return auth.authenticate()

    XML_ROOT = '<?xml version="1.0" encoding="UTF-8"?>'

    _message_nsmap = {'dcterms': 'http://purl.org/dc/terms/', 'media': 'http://search.yahoo.com/mrss/',
                      'dc': 'http://purl.org/dc/elements/1.1/', 'mi': 'http://schemas.ingestion.microsoft.com/common/',
                      'content': 'http://purl.org/rss/1.0/modules/content/'}

#    feed = etree.Element('feed', attrib={'lang': 'en-us'}, nsmap=_message_nsmap)
    feed = etree.Element('rss', attrib={'version': '2.0'}, nsmap=_message_nsmap)
    channel = SubElement(feed, 'channel')
    SubElement(channel, 'title').text = '{} RSS Feed'.format(app.config['SITE_NAME'])
    SubElement(channel, 'description').text = '{} RSS Feed'.format(app.config['SITE_NAME'])
    SubElement(channel, 'link').text = flask.url_for('rss.get_rss', _external=True)

    response = get_internal('news/search')
#    req = ParsedRequest()
#    req.args = {'include_fields': 'abstract'}
#    response = superdesk.get_resource_service('news/search').get(req=req, lookup=None)

    for item in response[0].get('_items'):
        try:
            complete_item = superdesk.get_resource_service('items').find_one(req=None, _id=item.get('_id'))

            # If featuremedia is not allowed for the company don't add the item
            if ((complete_item.get('associations') or {}).get('featuremedia') or {}).get('renditions'):
                if not check_association_permission(complete_item):
                    continue
            remove_unpermissioned_embeds(complete_item, g.user)

            entry = SubElement(channel, 'item')

            # If the item has any parents we use the id of the first, this should be constant throught the update
            # history
            if complete_item.get('ancestors') and len(complete_item.get('ancestors')):
                SubElement(entry, 'guid').text = complete_item.get('ancestors')[0]
            else:
                SubElement(entry, 'guid').text = complete_item.get('_id')

            SubElement(entry, 'title').text = etree.CDATA(complete_item.get('headline'))
            SubElement(entry, 'pubDate').text = _format_date_3(complete_item.get('firstpublished'))
            SubElement(entry, etree.QName(_message_nsmap.get('dcterms'), 'modified')).text = _format_date_2(
                complete_item.get('versioncreated'))
            if token:
                SubElement(entry, 'link').text = flask.url_for('news/item.get_item',
                                                               item_id=item.get('_id'),
                                                               format='TextFormatter',
                                                               token=token,
                                                               _external=True)
            else:
                SubElement(entry, 'link').text = flask.url_for('news/item.get_item',
                                                               item_id=item.get('_id'),
                                                               format='TextFormatter',
                                                               _external=True)

            if complete_item.get('byline'):
                name = complete_item.get('byline')
                if complete_item.get('source') and not app.config['COPYRIGHT_HOLDER'].lower() == complete_item.get(
                        'source', '').lower():
                    name = name + " - " + complete_item.get('source')
                SubElement(entry, etree.QName(_message_nsmap.get('dc'), 'creator')).text = name
            else:
                SubElement(entry, etree.QName(_message_nsmap.get('dc'), 'creator')).text = \
                    complete_item.get('source') if complete_item.get('source') else app.config['COPYRIGHT_HOLDER']

            SubElement(entry, 'source', attrib={'url': flask.url_for('rss.get_rss', _external=True)}).text = \
                complete_item.get('source', '')

            if complete_item.get('pubstatus') == 'usable':
                SubElement(entry, etree.QName(_message_nsmap.get('dcterms'), 'valid')).text = \
                    'start={}; end={}; scheme=W3C-DTF'.format(_format_date(utcnow()),
                                                              _format_date(utcnow() + datetime.timedelta(days=30)))
            else:
                # in effect a kill set the end date into the past
                SubElement(entry, etree.QName(_message_nsmap.get('dcterms'), 'valid')).text = \
                    'start={}; end={}; scheme=W3C-DTF'.format(_format_date(utcnow()),
                                                              _format_date(utcnow() - datetime.timedelta(days=30)))

            categories = [{'name': s.get('name')} for s in complete_item.get('service', [])] \
                + [{'name': s.get('name')} for s in complete_item.get('subject', [])] \
                + [{'name': s.get('name')} for s in complete_item.get('place', [])] \
                + [{'name': k} for k in complete_item.get('keywords', [])]
            for category in categories:
                SubElement(entry, 'category').text = category.get('name')

            SubElement(entry, 'description').text = etree.CDATA(complete_item.get('description_text', ''))

            # If there are any image embeds then reset the source to a Newshub asset
            regex = r" EMBED START (?:Image|Video|Audio) {id: \"editor_([0-9]+)"
            root_elem = lxml_html.fromstring(complete_item.get('body_html', ''))
            comments = root_elem.xpath('//comment()')
            html_updated = False
            for comment in comments:
                m = re.search(regex, comment.text)
                if m and m.group(1):
                    embed_id = "editor_" + m.group(1)
                    fig_elem = comment.getnext()
                    if fig_elem is not None and fig_elem.tag == "figure":
                        for tag, rendition in [("./audio", "original"), ("./video", "original"), ("./img", "16-9")]:
                            elem = fig_elem.find(tag)
                            src = complete_item.get("associations", {}).get(embed_id, {}).get("renditions", {}).get(
                                rendition)
                            if src is not None and elem is not None:
                                token_param = {'token': token} if token else {}
                                elem.attrib["src"] = flask.url_for('assets.download',
                                                                   asset_id=src.get('media'),
                                                                   item_id=item.get("_id"),
                                                                   _external=True,
                                                                   **token_param)
                                html_updated = True
                                break

            if html_updated:
                complete_item["body_html"] = to_string(root_elem, method="html")

            SubElement(entry, etree.QName(_message_nsmap.get('content'), 'encoded')).text = etree.CDATA(
                complete_item.get('body_html', ''))

            if ((complete_item.get('associations') or {}).get('featuremedia') or {}).get('renditions'):
                image = ((complete_item.get('associations') or {}).get('featuremedia') or {}).get('renditions').get(
                    "16-9")
                metadata = ((complete_item.get('associations') or {}).get('featuremedia') or {})

                url = flask.url_for('assets.get_item', _external=True, asset_id=image.get('media'),
                                    token=token) if token else flask.url_for(
                    'assets.get_item', _external=True, asset_id=image.get('media'))

                media = SubElement(entry, etree.QName(_message_nsmap.get('media'), 'content'),
                                   attrib={'url': url, 'type': image.get('mimetype'), 'medium': 'image'})

                SubElement(media, etree.QName(_message_nsmap.get('media'), 'credit')).text = metadata.get('byline')
                SubElement(media, etree.QName(_message_nsmap.get('media'), 'title')).text = metadata.get(
                    'description_text')
                SubElement(media, etree.QName(_message_nsmap.get('media'), 'text')).text = metadata.get('body_text')
                focr = SubElement(media, etree.QName(_message_nsmap.get('mi'), 'focalRegion'))
                SubElement(focr, etree.QName(_message_nsmap.get('mi'), 'x1')).text = str(image.get('poi').get('x'))
                SubElement(focr, etree.QName(_message_nsmap.get('mi'), 'x2')).text = str(image.get('poi').get('x'))
                SubElement(focr, etree.QName(_message_nsmap.get('mi'), 'y1')).text = str(image.get('poi').get('y'))
                SubElement(focr, etree.QName(_message_nsmap.get('mi'), 'y2')).text = str(image.get('poi').get('y'))
        except Exception as ex:
            logger.exception('processing {} - {}'.format(item.get('_id'), ex))

    return flask.Response(XML_ROOT + etree.tostring(feed, method='xml', pretty_print=True).decode('utf-8'),
                          mimetype='application/rss+xml')
