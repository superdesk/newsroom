from flask import Blueprint
from .reports import get_company_saved_searches, get_user_saved_searches, get_company_products

blueprint = Blueprint('reports', __name__)


reports = {
    'company-saved-searches': get_company_saved_searches,
    'user-saved-searches': get_user_saved_searches,
    'company-products': get_company_products,
}


from . import views  # noqa
