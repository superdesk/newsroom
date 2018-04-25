from flask import Blueprint

blueprint = Blueprint('public', __name__)

from . import views  # noqa