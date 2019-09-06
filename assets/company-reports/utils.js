import CompanyProducts from './components/CompanyProducts';
import UserSavedSearches from './components/UserSavedSearches';
import CompanySavedSearches from './components/CompanySavedSearches';
import ProductStories from './components/ProductStories';
import Company from './components/Company';
import SubscriberActivity from './components/SubscriberActivity';


export const REPORTS_NAMES = {
    'COMPANY_SAVED_SEARCHES': 'company-saved-searches',
    'USER_SAVED_SEARCHES': 'user-saved-searches',
    'COMPANY_PRODUCTS': 'company-products',
    'PRODUCT_STORIES': 'product-stories',
    'COMPANY': 'company',
    'SUBSCRIBER_ACTIVITY': 'subscriber-activity'
};

export const panels = {
    [REPORTS_NAMES.COMPANY_SAVED_SEARCHES]: CompanySavedSearches,
    [REPORTS_NAMES.USER_SAVED_SEARCHES]: UserSavedSearches,
    [REPORTS_NAMES.COMPANY_PRODUCTS]: CompanyProducts,
    [REPORTS_NAMES.PRODUCT_STORIES]: ProductStories,
    [REPORTS_NAMES.COMPANY]: Company,
    [REPORTS_NAMES.SUBSCRIBER_ACTIVITY]: SubscriberActivity,
};
