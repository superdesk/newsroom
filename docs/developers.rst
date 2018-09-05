Developers Guide
================

Adding new modules
------------------

You can extend newsroom via creating python module with :meth:`init_app` method::

    from flask import Blueprint

    blueprint = Blueprint('foo')

    @blueprint.route('/foo')
    def index():
        pass

    def init_app(app):
        app.section('foo', 'Foo')
        app.sidenav('Foo', 'foo.index', section='foo')
        app.register_blueprint(blueprint)

Such module should be added to ``settings.INSTALLED_APPS`` and then it will be loaded on start.
Param ``app`` is :class:`newsroom.Newsroom` instance.

Templating
----------

When defining new templates you should extend layout to get basic markup/css/js::

    {% extends "layout.html" %}

    {% block title %}Foo{% endblock %}

    {% block breadcrumb %}
    <span class="breadcrumb-item active">Foo</span>
    {% endblock %}

    {% block content %}
    <div id="foo-app" class="content">
        <h1>Foo</h1>
        <p>Here goes content</p>
    </div>
    {% endblock %}

    {% block script %}
        <script>
            // custom scripts
        </script>
        {{ javascript_tag('foo_js') | safe }}
    {% endblock %}

Templates can be added to ``newsroom/templates`` folder or to top level ``templates`` dir.

Javascript
----------

We use single page web app for each module. Those can be loaded via :meth:`javascript_tag` template helper
using webpack build entrypoint name, which must be added first to ``webpack.config.js``.

To run webpack dev server use ``npm run start`` and then start newroom via ``honcho run``.

Javascript files are located in ``assets`` folder.
