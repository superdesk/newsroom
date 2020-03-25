
from babel import core
from flask import request, current_app, session
from flask_babel import Babel, get_translations
from newsroom.auth import get_user


def get_client_translations(domain='client'):
    translations = get_translations()
    return {key: val for key, val in translations._catalog.items() if key and val}


def get_client_locales():
    client_locales = []

    for locale in current_app.config['LANGUAGES']:
        lang, *territory = locale.split('_')
        if len(territory) == 1:
            display_name = core.Locale(lang, territory=territory[0]).display_name.title()
        else:
            display_name = core.Locale(locale).display_name
        client_locales.append({
            'locale': locale,
            'name': display_name
        })

    return client_locales


def setup_babel(app):
    babel = Babel(app)

    @babel.localeselector
    def _get_locale():
        try:
            if session.get('locale'):
                return session['locale']
            user = get_user()
            if user and user.get('locale'):
                return user['locale']
        except RuntimeError:
            pass
        if request:
            if request.args.get('language') and request.args.get('language') in app.config['LANGUAGES']:
                return request.args['language']
            else:
                return request.accept_languages.best_match(app.config['LANGUAGES'])
        return app.config['DEFAULT_LANGUAGE']

    app.add_template_global(get_client_translations)
    app.add_template_global(get_client_locales)
    app.add_template_global(_get_locale, 'get_locale')
