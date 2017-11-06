
def get_picture(item):
    if item['type'] == 'picture':
        return item
    return item.get('associations', {}).get('featuremedia')


def get_caption(picture):
    if picture:
        return picture.get('body_text', picture.get('description_text'))
