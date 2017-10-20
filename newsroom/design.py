import flask

blueprint = flask.Blueprint('design', __name__)


@blueprint.route('/design/detail')
def detail():
    item = {'headline': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
            'slugline': 'Slugline',
            'byline': 'Author byline',
            'versioncreated|datetime_long': 'Version created',
            'description_html': 'IN this exclusive interview, Aussie rock legend Jimmy Barnes reveals how he almost paid the ultimate price for his years of hard living.',  # noqa
            'body_html': 'IT may have been the sleeping tablets. On top of the emptied minibar. On top of the cocaine, ecstasy and ketamine Jimmy Barnes had ingested to escape his demons. But the morning after the night before, when the rocker saw the dressing gown belt tied around a wardrobe rail in the ensuite of his Auckland hotel room, he was confronted with the reality he had attempted suicide. As he reveals in Working Class Man, the sequel to his best-selling Working Class Boy memoir, he had no recollection of getting out of bed and trying to take his life on that night in 2012. Confronting the evidence and confessing to wife Jane made him change his life forever, so he could keep living.',  # noqa
            }
    return flask.render_template('wire_item.html', item=item)


@blueprint.route('/design/')
def index():
    return flask.render_template('design_index.html')


@blueprint.route('/design/<page>')
def page(page):
    return flask.render_template('design_%s.html' % page)
