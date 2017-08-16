import flask


blueprint = flask.Blueprint('auth', __name__)


@blueprint.route('/login', methods=['GET', 'POST'])
def login():
    kwargs = {}
    if flask.request.method == 'POST':
        if flask.request.form.get('username') == 'admin' and flask.request.form.get('password') == 'admin':
            flask.session['username'] = flask.request.form.get('username')
            return flask.redirect(flask.url_for('news.index'))
        kwargs['credentials_error'] = True
        kwargs['username'] = flask.request.form.get('username', '')
    return flask.render_template('auth_login.html', **kwargs)


@blueprint.route('/logout')
def logout():
    flask.session['username'] = None
    return flask.redirect(flask.url_for('news.index'))
