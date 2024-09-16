import flask
from flask import current_app as app
from lxml import html as lxml_html
import re
from ...upload import ASSETS_RESOURCE
from newsroom.settings import get_setting
from superdesk import get_resource_service
from superdesk.etree import to_string
from newsroom.products.products import get_products_by_company
from newsroom.auth import get_user


def remove_internal_renditions(item, remove_media=False):
    """
    Remove the internal and original image renditions from the feature media and embedded media. The media can
    optionaly be removed as we do not serve this on the api.
    :param item:
    :param remove_media:
    :return:
    """
    allowed_pic_renditions = get_setting('news_api_allowed_renditions').split(',')
    for association_key, association_item in item.get('associations', {}).items():
        clean_renditions = dict()
        for key, rendition in association_item.get('renditions', {}).items():
            if association_item.get('type') == 'picture':
                if key in allowed_pic_renditions:
                    if remove_media:
                        rendition.pop('media', None)
                    clean_renditions[key] = rendition
            else:
                clean_renditions[key] = rendition

        item['associations'][association_key]['renditions'] = clean_renditions

        if isinstance(association_item, dict):
            association_item.pop('products', None)
            association_item.pop('subscribers', None)

    return item


def add_media(zf, item):
    added_files = []
    associations = item.get('associations', {})
    for associated_item in associations.values():
        if not associated_item:
            continue

        renditions = associated_item.get('renditions')
        if not renditions or not isinstance(renditions, dict):
            continue

        for rendition_data in renditions.values():
            if not rendition_data:
                continue

            name = rendition_data.get('href', '').lstrip('/')
            if name in added_files:
                continue

            media_id = rendition_data.get('media')
            if not media_id:
                flask.current_app.logger.warning(f"Media ID not found for rendition: {name}")
                continue

            file = flask.current_app.media.get(media_id, ASSETS_RESOURCE)
            if not file:
                flask.current_app.logger.warning(f"File not found: {name}")
                continue

            try:
                zf.writestr(name, file.read())
                added_files.append(name)
            except Exception as e:
                flask.current_app.logger.error(f"Error adding file to zip: {name}. Error: {str(e)}")


def rewire_featuremedia(item):
    """
    Set the references in the feature media strip the leading / to make it a legitimate relative path
    :param item:
    :return:
    """
    renditions = item.get('associations', {}).get('featuremedia', {}).get('renditions', [])
    for rendition in renditions:
        item['associations']['featuremedia']['renditions'][rendition]['href'] = \
            item['associations']['featuremedia']['renditions'][rendition]['href'].lstrip('/')


def log_media_downloads(item):
    """
    Given an item create a download entry for all the associations
    :param item:
    :return:
    """
    for _key, associated_item in item.get('associations', {}).items():
        action = 'download ' + associated_item.get('type')
        get_resource_service('history').create_media_history_record(item, _key, action, get_user(required=True),
                                                                    flask.request.args.get('type', 'wire'))


def remove_unpermissioned_embeds(item, company_id=None, section='wire'):
    """
    :param item:
    :param company_id:
    :param section
    :return: The item with the embeds that the user is not allowed to download removed
    """

    if not app.config.get("EMBED_PRODUCT_FILTERING"):
        return

    kill_keys = []

    if company_id is None:
        user = get_user(required=False)
        if user:
            company_id = user.get('company')
        else:
            company_id = flask.g.user

    # get the list of superdesk products that the company is permissioned for
    permitted_products = [p.get('sd_product_id') for p in
                          get_products_by_company(company_id, None, section) if p.get('sd_product_id')]

    for key, embed_item in item.get("associations", {}).items():
        if key.startswith("editor_"):
            # get the list of products that the embedded item matched in superdesk
            embed_products = [p.get('code') for p in
                              ((item.get('associations') or {}).get(key) or {}).get('products', [])]

            if not len(set(embed_products) & set(permitted_products)):
                kill_keys.append(key)

    # Nothing to do
    if len(kill_keys) == 0:
        return

    root_elem = lxml_html.fromstring(item.get('body_html', ''))
    regex = r" EMBED START (?:Image|Video|Audio) {id: \"editor_([0-9]+)"
    html_updated = False
    comments = root_elem.xpath('//comment()')
    for comment in comments:
        m = re.search(regex, comment.text)
        # if we've found an Embed Start comment
        if m and m.group(1):
            if "editor_" + m.group(1) in kill_keys:
                parent = comment.getparent()
                for elem in comment.itersiblings():
                    parent.remove(elem)
                    if elem.text and ' EMBED END ' in elem.text:
                        break
                parent.remove(comment)
                html_updated = True
    if html_updated:
        item["body_html"] = to_string(root_elem, method="html")

    for key in kill_keys:
        item.get("associations", {}).pop(key, None)
        if "refs" in item:
            item["refs"] = [r for r in item.get("refs", []) if r["key"] != key]
