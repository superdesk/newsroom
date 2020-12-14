import superdesk
import flask
from eve.methods.get import get_internal
from lxml import etree
from lxml.etree import SubElement
from superdesk.utc import utcnow
from flask import current_app as app
import datetime
import logging

blueprint = superdesk.Blueprint('atom', __name__)


logger = logging.getLogger(__name__)


def init_app(app):
    superdesk.blueprint(blueprint, app)


@blueprint.route('/atom', methods=['GET'])
def get_atom():

    def _format_date(date):
        iso8601 = date.isoformat()
        if date.tzinfo:
            return iso8601
        return iso8601 + 'Z'

    def _format_date_2(date):
        DATETIME_FORMAT = "%Y-%m-%dT%H:%M:%S"
        return date.strftime(DATETIME_FORMAT) + 'Z'

    auth = app.auth
    if not auth.authorized([], None, flask.request.method):
        return auth.authenticate()

    XML_ROOT = '<?xml version="1.0" encoding="UTF-8"?>'

    _message_nsmap = {None: 'http://www.w3.org/2005/Atom', 'dcterms': 'http://purl.org/dc/terms/',
                      'media': 'http://search.yahoo.com/mrss/',
                      'mi': 'http://schemas.ingestion.microsoft.com/common/'}

#    feed = etree.Element('feed', attrib={'lang': 'en-us'}, nsmap=_message_nsmap)
    feed = etree.Element('feed', nsmap=_message_nsmap)
    SubElement(feed, 'title').text = etree.CDATA('{} Atom Feed'.format(app.config['SITE_NAME']))
    SubElement(feed, 'updated').text = _format_date_2(utcnow())
    SubElement(SubElement(feed, 'author'), 'name').text = app.config['SITE_NAME']
    SubElement(feed, 'id').text = flask.url_for('atom.get_atom', _external=True)
    SubElement(feed, 'link', attrib={'href': flask.url_for('atom.get_atom', _external=True), 'rel': 'self'})

    response = get_internal('news/search')
#    req = ParsedRequest()
#    req.args = {'include_fields': 'abstract'}
#    response = superdesk.get_resource_service('news/search').get(req=req, lookup=None)

    for item in response[0].get('_items'):
        try:
            complete_item = item = superdesk.get_resource_service('items').find_one(req=None, _id=item.get('_id'))
            entry = SubElement(feed, 'entry')

            # If the item has any parents we use the id of the first, this should be constant throught the update
            # history
            if item.get('ancestors') and len(item.get('ancestors')):
                SubElement(entry, 'id').text = item.get('ancestors')[0]
            else:
                SubElement(entry, 'id').text = item.get('_id')

            SubElement(entry, 'title').text = etree.CDATA(item.get('headline'))
            SubElement(entry, 'published').text = _format_date(complete_item.get('firstpublished'))
            SubElement(entry, 'updated').text = _format_date_2(item.get('versioncreated'))
            SubElement(entry, 'link', attrib={'rel': 'self', 'href': flask.url_for('news/item.get_item',
                                                                                   item_id=item.get('_id'),
                                                                                   format='TextFormatter',
                                                                                   _external=True)})
            if item.get('byline'):
                SubElement(SubElement(entry, 'author'), 'name').text = item.get('byline')

            if item.get('pubstatus') == 'usable':
                SubElement(entry, etree.QName(_message_nsmap.get('dcterms'), 'valid')).text = \
                    'start={}; end={}; scheme=W3C-DTF'.format(_format_date(utcnow()),
                                                              _format_date(utcnow() + datetime.timedelta(days=30)))
            else:
                # in effect a kill set the end date into the past
                SubElement(entry, etree.QName(_message_nsmap.get('dcterms'), 'valid')).text = \
                    'start={}; end={}; scheme=W3C-DTF'.format(_format_date(utcnow()),
                                                              _format_date(utcnow() - datetime.timedelta(days=30)))

            categories = [{'name': s.get('name')} for s in item.get('service', [])]
            for category in categories:
                SubElement(entry, 'category', attrib={'term': category.get('name')})

            SubElement(entry, 'summary').text = etree.CDATA(complete_item.get('description_text', ''))
            SubElement(entry, 'content', attrib={'type': 'html'}).text = etree.CDATA(complete_item.get('body_html', ''))

            if ((item.get('associations') or {}).get('featuremedia') or {}).get('renditions'):
                image = ((item.get('associations') or {}).get('featuremedia') or {}).get('renditions').get("16-9")
                metadata = ((item.get('associations') or {}).get('featuremedia') or {})

                url = flask.url_for('assets.get_item', _external=True, asset_id=image.get('media'))
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

    return flask.Response(XML_ROOT + etree.tostring(feed, pretty_print=True).decode('utf-8'),
                          mimetype='application/atom+xml')
