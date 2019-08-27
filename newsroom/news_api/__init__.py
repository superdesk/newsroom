

def init_app(app):
    if not app.config.get('NEWS_API_ENABLED'):
        return

    app.section('news_api', 'News API', 'api')
