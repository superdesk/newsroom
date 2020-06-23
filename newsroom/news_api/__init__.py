from flask_babel import gettext


def init_app(app):
    if not app.config.get('NEWS_API_ENABLED'):
        return

    if getattr(app, 'section'):
        app.section('news_api', 'News API', 'api')

    app.general_setting(
        'news_api_time_limit_days',
        gettext('Time limit for News API products (in days)'),
        type='number',
        min=0,
        weight=500,
        description=gettext('You can create an additional filter on top of the product definition. The time limit can be enabled for each company in the Permissions.'),  # noqa
        default=app.config.get('NEWS_API_TIME_LIMIT_DAYS', 0)
    )
