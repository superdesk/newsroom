from functools import wraps
from flask import current_app as app
from newsroom.auth import get_user
from newsroom.wire.block_media.company_factory import CompanyFactory
from lxml import html as lxml_html
import re
import logging
from superdesk.etree import to_string
logger = logging.getLogger(__name__)


def filter_media(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not app.config.get("EMBED_PRODUCT_FILTERING"):
            return func(*args, **kwargs)

        item_arg = get_item_argument(args, kwargs)
        if item_arg is None:
            return func(*args, **kwargs)

        embedded_data = get_embedded_data()
        if not any(embedded_data.values()):
            return func(*args, **kwargs)

        item_arg = process_item_embeds(item_arg, embedded_data)

        return func(*args, **kwargs)

    return wrapper


def get_item_argument(args, kwargs):
    if len(args) > 1 and isinstance(args[1], dict) and 'body_html' in args[1]:
        return args[1]

    for arg in args:
        if isinstance(arg, dict) and 'body_html' in arg:
            return arg

    return kwargs.get('item')


def get_embedded_data():
    try:
        user = get_user(required=True)
        return CompanyFactory.get_embedded_data(user)
    except Exception as e:
        logger.error(f"Error in from embedded data: {str(e)}")
        return {}


def process_item_embeds(item_arg, embedded_data):
    html_updated = False
    html_string = item_arg.get('body_html', '')
    root_elem = lxml_html.fromstring(html_string)

    allowed_tags = get_allowed_tags(embedded_data)

    if allowed_tags:
        html_updated = process_allowed_tags(root_elem, allowed_tags)

    if html_updated:
        item_arg["body_html"] = to_string(root_elem, method="html")

    es_highlight = item_arg.get('es_highlight', {})
    es_highlight_body_html = es_highlight.get('body_html', [])

    if len(es_highlight_body_html) > 0:
        es_highlight_html_string = es_highlight_body_html[0]
        es_highlight_root_elem = lxml_html.fromstring(es_highlight_html_string)

        es_highlight_allowed_tags = allowed_tags

        if es_highlight_allowed_tags:
            es_highlight_html_updated = process_allowed_tags(es_highlight_root_elem, es_highlight_allowed_tags)

        if es_highlight_html_updated:
            item_arg['es_highlight']['body_html'][0] = to_string(es_highlight_root_elem, method="html")

    return item_arg


def get_allowed_tags(embedded_data):
    tag_mapping = {
        'video': ('video_display', 'video_download'),
        'audio': ('audio_display', 'audio_download'),
        'img': ('images_display', 'images_download'),
        'all': ('all_display', 'all_download'),
        'social_media': ('social_media_display', 'social_media_download'),
        'sd': ('sdpermit_display', 'sdpermit_download'),
    }

    allowed_tags = {
        'display_tags': [tag for tag, (display_key, _) in tag_mapping.items() if embedded_data.get(display_key, False)],
        'download_tags': [tag for tag, (_, download_key) in tag_mapping.items()
                          if embedded_data.get(download_key, False)],
    }

    return allowed_tags


def process_allowed_tags(root_elem, allowed_tags):
    html_updated = False

    display_social_tag = False
    download_social_tag = False

    display_tags = allowed_tags['display_tags']

    if 'all' in display_tags or (not any(display_tags)):
        display_tags = ['video', 'audio', 'img', 'social_media']
        display_social_tag = True
    if 'social_media' in display_tags:
        display_social_tag = True

    download_tags = allowed_tags['download_tags']
    if 'all' in download_tags or (not any(download_tags)):
        download_tags = ['video', 'audio', 'img', 'social_media']
        download_social_tag = True
    if 'social_media' in download_tags:
        download_social_tag = True

    tag_map = {'video': 'Video', 'audio': 'Audio', 'img': 'Image'}
    display_regex_parts = ['|'.join(tag_map[tag] for tag in tag_map if tag not in display_tags)]

    display_regex = rf" EMBED START (?:{'|'.join(display_regex_parts)}) {{id: \"editor_([0-9]+)"
    download_regex_parts = ['|'.join(tag_map[tag] for tag in tag_map if tag not in download_tags)]
    download_regex = rf" EMBED START (?:{'|'.join(download_regex_parts)}) {{id: \"editor_([0-9]+)"

    comments = root_elem.xpath('//comment()')
    for comment in comments:
        display_match = re.search(display_regex, comment.text)
        download_match = re.search(download_regex, comment.text)

        if display_match and display_match.group(1):
            figure = comment.getnext()
            for elem in figure.iterchildren():
                if elem.tag not in display_tags:
                    figure.attrib['class'] = 'disabled-embed'
                    html_updated = True
                    break

        figure = comment.getnext()
        if figure is None:
            continue
        if download_match and download_match.group(1):
            for elem in figure.iterchildren():
                if elem.tag not in download_tags:
                    elem.attrib['data-disable-download'] = 'true'
                    html_updated = True
                    break

    if not display_social_tag:
        social_media_embeds = root_elem.xpath('//div[@class="embed-block"]')
        for social_media_embed in social_media_embeds:
            social_media_embed.attrib['class'] = 'embed-block disabled-embed'
            html_updated = True

    if not download_social_tag:
        social_media_embeds = root_elem.xpath('//div[@class="embed-block"]')
        for social_media_embed in social_media_embeds:
            blockquote_elements = social_media_embed.xpath('.//blockquote')
            for blockquote in blockquote_elements:
                blockquote.attrib['data-disable-download'] = 'true'
                html_updated = True
                break

    return html_updated
