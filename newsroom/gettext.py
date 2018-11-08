
from babel import support, core
from flask import request, current_app, session
from flask_babel import Babel, get_locale
from newsroom.auth import get_user


def get_client_translations(domain='client'):
    babel = current_app.extensions['babel']
    for dirname in babel.translation_directories:
        translations = support.Translations.load(
            dirname,
            [get_locale()],
            domain
        )
        return {key: val for key, val in translations._catalog.items() if key}
    return {}


def get_client_locales():
    return [
        {'locale': locale, 'name': core.Locale(locale).display_name} for locale in current_app.config['LANGUAGES']
    ]


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
            return request.accept_languages.best_match(app.config['LANGUAGES'])
        return app.config['DEFAULT_LANGUAGE']

    app.add_template_global(get_client_translations)
    app.add_template_global(get_client_locales)
    app.add_template_global(_get_locale, 'get_locale')
