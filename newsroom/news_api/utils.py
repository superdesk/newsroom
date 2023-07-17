from superdesk import get_resource_service
from superdesk.utc import utcnow
from flask import request, g, current_app as app, url_for
from newsroom.products.products import get_products_by_company
from newsroom.settings import get_setting
from newsroom.utils import update_embeds_in_body


def post_api_audit(doc):
    audit_doc = {
        'created': utcnow(),
        'items_id': [doc.get('_id')] if doc.get('_id') else [i.get('_id') for i in doc.get('_items', [])],
        'remote_addr': request.access_route[0] if request.access_route else request.remote_addr,
        'uri': request.url,
        'endpoint': (request.endpoint or '').replace('|resource', '')
    }

    # g.user contains comapny._id from CompanyTokenAuth.check_auth]
    if 'user' in g:
        audit_doc['subscriber'] = g.user

    get_resource_service('api_audit').post([audit_doc])


def format_report_results(search_result, unique_endpoints, companies):
    aggs = (search_result.hits or {}).get('aggregations') or {}
    buckets = (aggs.get('items') or {}).get('buckets') or []
    results = {}

    for b in buckets:
        company_name = (companies[b['key']] or {}).get('name')
        results[company_name] = {}
        for endpoint_bucket in ((b.get('endpoints') or {}).get('buckets') or []):
            results[company_name][endpoint_bucket['key']] = endpoint_bucket['doc_count']
            if endpoint_bucket['key'] not in unique_endpoints:
                unique_endpoints.append(endpoint_bucket['key'])

    return results


def remove_internal_renditions(item):
    clean_renditions = dict()

    # associations featuremedia will contain the internal newsroom renditions, we need to remove these.
    if ((item.get('associations') or {}).get('featuremedia') or {}).get('renditions'):
        for key, rendition in\
                item['associations']['featuremedia']['renditions'].items():
            if key in get_setting('news_api_allowed_renditions').split(','):
                rendition.pop('media', None)
                clean_renditions[key] = rendition

        item['associations']['featuremedia']['renditions'] = clean_renditions
    for key, meta in item.get('associations', {}).items():
        if isinstance(meta, dict):
            meta.pop('products', None)
            meta.pop('subscribers', None)

    return item


def check_association_permission(item):
    """
    Check if any of the products that the passed image item matches are permissioned superdesk products for the
     company
    :param item:
    :return:
    """
    if not app.config.get('NEWS_API_IMAGE_PERMISSIONS_ENABLED'):
        return True

    if ((item.get('associations') or {}).get('featuremedia') or {}).get('products'):
        # Extract the products that the image matched in Superdesk
        im_products = [p.get('code') for p in
                       ((item.get('associations') or {}).get('featuremedia') or {}).get('products')]

        # Check if the one of the companies products that has a superdesk product id matches one of the
        # image product id's
        sd_products = [p.get('sd_product_id') for p in get_products_by_company(g.user, None, 'news_api') if
                       p.get('sd_product_id')]

        return True if len(set(im_products) & set(sd_products)) else False
    else:
        return True


def set_embed_links(item):
    """
    Sets the reference links in the embeds to include the item id so that calls to them can be logged against the
    item that the embed belongs to
    :param item:
    :return:
    """

    def update_url(item, elem, group):
        elem.attrib["src"] = elem.attrib["src"] + "?item_id=" + item.get("_id")
        return True

    if not app.config.get("EMBED_PRODUCT_FILTERING"):
        return
    if not item.get('body_html', ''):
        return

    update_embeds_in_body(item, update_url, update_url, update_url)

    for key, ass in item.get("associations", {}).items():
        if isinstance(ass, dict) and not key == "featuremedia":
            for rendition in ass.get("renditions"):
                if ass.get('renditions', {}).get(rendition, {}).get("href"):
                    ass.get('renditions', {}).get(rendition, {})["href"] = ass.get('renditions', {}).get(rendition,
                                                                                                         {}).get(
                        "href") + '?item_id=' + item.get("_id")


def update_embed_urls(item, token):
    """
    Update the urls in the embeds to the endpoint that allows logging
    :param item:
    :param token:
    :return:
    """
    def update_embed(item, elem, group):
        embed_id = "editor_" + group
        if elem.tag in ["audio", "video"]:
            rendition = "original"
        elif elem.tag == "img":
            rendition = "16-9"
        src = item.get("associations", {}).get(embed_id, {}).get("renditions", {}).get(
            rendition)
        if src is not None and elem is not None:
            params = {"item_id": item.get("_id")}
            if token:
                params["token"] = token
            elem.attrib["src"] = url_for('assets.get_item', asset_id=src.get('media'),
                                         _external=True, **params)
        return True

    if app.config.get("EMBED_PRODUCT_FILTERING"):
        update_embeds_in_body(item, update_embed, update_embed, update_embed)
