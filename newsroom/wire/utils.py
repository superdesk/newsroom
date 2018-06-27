
def get_picture(item):
    if item['type'] == 'picture':
        return item
    return item.get('associations', {}).get('featuremedia', get_body_picture(item))


def get_body_picture(item):
    pictures = [assoc for assoc in item.get('associations', {}).values() if assoc.get('type') == 'picture']
    if pictures:
        return pictures[0]


def get_caption(picture):
    if picture:
        return picture.get('body_text', picture.get('description_text'))
