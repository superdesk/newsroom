from flask import Blueprint
from .reports import get_company_saved_searches, \
    get_user_saved_searches, get_company_products, get_product_stories, get_company_report

blueprint = Blueprint('reports', __name__)


reports = {
    'company-saved-searches': get_company_saved_searches,
    'user-saved-searches': get_user_saved_searches,
    'company-products': get_company_products,
    'product-stories': get_product_stories,
    'company': get_company_report,
}


from . import views  # noqa
