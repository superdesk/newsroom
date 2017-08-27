import flask
from newsroom.news import blueprint
from newsroom.utils import query_resource


@blueprint.route('/')
def index():
    result = query_resource('search_capi', max_results=50)
    return flask.render_template(
        'news_index.html',
        items=list(result),
        total=result.count(),
        query=flask.request.args.get('q', ''))
