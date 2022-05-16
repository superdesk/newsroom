from flask_babel import lazy_gettext


def init_app(app):
    if not app.config.get('NEWS_API_ENABLED'):
        return

    if getattr(app, 'section'):
        app.section('news_api', 'News API', 'api')

    app.general_setting(
        'news_api_time_limit_days',
        lazy_gettext('Time limit for News API products (in days)'),
        type='number',
        min=0,
        weight=500,
        description=lazy_gettext('You can create an additional filter on top of the product definition. The time limit can be enabled for each company in the Permissions.'),  # noqa
        default=app.config.get('NEWS_API_TIME_LIMIT_DAYS', 0)
    )
    app.general_setting(
        'news_api_allowed_renditions',
        lazy_gettext('Image renditions the API can serve'),
        weight=600,
        description=lazy_gettext('A comma seperated list of the renditions that the API will return'),
        default=app.config.get('NEWS_API_ALLOWED_RENDITIONS', ''),
        validator=validate_renditions
    )


def validate_renditions(value):
    from newsroom.utils import is_safe_string

    if not is_safe_string(value, allowed_punctuation='|'):
        return lazy_gettext("Illegal character in the Image renditions the API can serve")
