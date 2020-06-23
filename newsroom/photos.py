def set_photo_coverage_href(coverage, planning_item, deliveries=[]):
    pass


def get_media_cards_external(card):
    """Get media cards data from external source. This is will be used to render wire home page media cards.

       Format of the output:
        [
            {
                media_url: <url to display tile image from external source>,
                description: <url to display tile caption from external source>,
                href: <navigate to the href on click of the tile>
            }
        ]
    :param card: dict containing information about external source.
    """
    pass


def customize_rtf_file(rtf_document):
    pass


def init_app(app):
    app.set_photo_coverage_href = set_photo_coverage_href
    app.get_media_cards_external = get_media_cards_external
    app.customize_rtf_file = customize_rtf_file
