from flask import Blueprint

blueprint = Blueprint('companies', __name__)

from . import views   # noqa
