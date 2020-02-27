import io
from PIL import Image, ImageEnhance
from flask import current_app as app
from newsroom.upload import ASSETS_RESOURCE

THUMBNAIL_SIZE = (640, 640)
THUMBNAIL_QUALITY = 80


def store_image(image, filename=None, _id=None):
    """Store the image to GridFs or AWS S3"""
    binary = io.BytesIO()
    if image.mode != 'RGB':
        image = image.convert('RGB')
    image.save(binary, 'jpeg', quality=THUMBNAIL_QUALITY)
    binary.seek(0)
    media_id = app.media.put(binary, filename=filename, _id=_id, resource=ASSETS_RESOURCE, content_type='image/jpeg')
    if not media_id:
        # media with the same id exists
        media_id = _id
    binary.seek(0)
    return {
        'media': str(media_id),
        'href': app.upload_url(media_id),
        'width': image.width,
        'height': image.height,
        'mimetype': 'image/jpeg'
    }


def get_thumbnail(image):
    image = image.copy()
    image.thumbnail(THUMBNAIL_SIZE)
    return image


def get_watermark(image):
    image = image.copy()
    if not app.config.get('WATERMARK_IMAGE'):
        return image
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    with open(app.config['WATERMARK_IMAGE'], mode='rb') as watermark_binary:
        watermark_image = Image.open(watermark_binary)
        set_opacity(watermark_image, 0.3)
        watermark_layer = Image.new('RGBA', image.size)
        watermark_layer.paste(watermark_image, (
            image.size[0] - watermark_image.size[0],
            int((image.size[1] - watermark_image.size[1]) * 0.66),
        ))

    watermark = Image.alpha_composite(image, watermark_layer)
    return watermark.convert('RGB')


def set_opacity(image, opacity=1):
    alpha = image.split()[3]
    alpha = ImageEnhance.Brightness(alpha).enhance(opacity)
    image.putalpha(alpha)


def generate_preview_details_renditions(picture):
    """Generate preview and details rendition"""
    if not picture or not picture.get('renditions'):
        return

    # add watermark to base/view images
    for key in ['base', 'view']:
        rendition = picture.get('renditions', {}).get('%sImage' % key)
        if rendition:
            binary = app.media.get(rendition['media'], resource=ASSETS_RESOURCE)
            im = Image.open(binary)
            watermark = get_watermark(im)
            picture['renditions'].update({
                '_newsroom_%s' % key: store_image(watermark,
                                                  _id='%s%s' % (rendition['media'], '_newsroom_%s' % key))
            })


def generate_renditions(item):
    picture = item.get('associations', {}).get('featuremedia', {})
    if not picture:
        return

    # use 4-3 rendition for generated thumbs
    renditions = picture.get('renditions', {})
    rendition = renditions.get('4-3', renditions.get('viewImage'))
    if not rendition:
        return

    # generate thumbnails
    binary = app.media.get(rendition['media'], resource=ASSETS_RESOURCE)
    im = Image.open(binary)
    thumbnail = get_thumbnail(im)  # 4-3 rendition resized
    watermark = get_watermark(im)  # 4-3 rendition with watermark
    picture['renditions'].update({
        '_newsroom_thumbnail': store_image(thumbnail,
                                           _id='%s%s' % (rendition['media'], '_newsroom_thumbnail')),
        '_newsroom_thumbnail_large': store_image(watermark,
                                                 _id='%s%s' % (rendition['media'], '_newsroom_thumbnail_large')),
    })
    app.generate_preview_details_renditions(picture)


def init_app(app):
    app.generate_renditions = generate_renditions
    app.generate_preview_details_renditions = generate_preview_details_renditions
