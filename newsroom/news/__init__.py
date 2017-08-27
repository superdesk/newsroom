from flask import Blueprint

blueprint = Blueprint('news', __name__)

from . import views  # noqa