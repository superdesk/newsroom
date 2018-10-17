
from babel import support
from flask import request, current_app
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


def setup_babel(app):
    babel = Babel(app)
    app.add_template_global(get_client_translations)

    @babel.localeselector
    def get_locale():
        try:
            user = get_user()
            if user and user.get('locale'):
                return user['locale']
        except RuntimeError:
            pass
        if request:
            return request.accept_languages.best_match(app.config['LANGUAGES'])
        return app.config['DEFAULT_LANGUAGE']
