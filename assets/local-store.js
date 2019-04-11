import moment from 'moment';
import Store from 'store';
import localStorage from 'store/storages/localStorage';
import operationsPlugin from 'store/plugins/operations';
import expirePlugin from 'store/plugins/expire';

import { get } from 'lodash';

const READ_ITEMS_STORE = 'read_items';
const NEWS_ONLY_STORE = 'news_only';
const FEATURED_ONLY_STORE = 'featured-only';
const FILTER_TAB = 'filter_tab';
const ACTIVE_DATE = 'active_date';
const DROPDOWN_FILTERS = 'dropdown_filters';

const store = Store.createStore([localStorage], [operationsPlugin, expirePlugin]);

/**
 * Get read items
 *
 * @returns {Object}
 */
export function getReadItems() {
    return store.get(READ_ITEMS_STORE);
}

/**
 * Marks the given item as read
 *
 * @param {Object} item
 * @param {Object} state
 */
export function markItemAsRead(item, state) {
    if (item && item._id && item.version) {
        const readItems = get(state, 'readItems', getReadItems()) || {};

        store.assign(READ_ITEMS_STORE, {[item._id]: getMaxVersion(readItems[item._id], item.version)});
    }
}

/**
 * Get news only value
 *
 * @returns {boolean}
 */
export function getNewsOnlyParam() {
    return !!((store.get(NEWS_ONLY_STORE) || {}).value);
}


/**
 * Toggles news only value
 *
 */
export function toggleNewsOnlyParam() {
    store.assign(NEWS_ONLY_STORE, {value: !getNewsOnlyParam()});
}

/**
 * Get featured stories only value
 *
 * @returns {boolean}
 */
export function getFeaturedOnlyParam() {
    return !!((store.get(FEATURED_ONLY_STORE) || {}).value);
}


/**
 * Featured stories only value
 *
 */
export function toggleFeaturedOnlyParam() {
    store.assign(FEATURED_ONLY_STORE, {value: !getFeaturedOnlyParam()});
}

/**
 * Get active filter tab
 *
 * @returns {boolean}
 */
export function getActiveFilterTab(context) {
    return get(store.get(FILTER_TAB), context, '');
}

/**
 * Set active filter tab
 *
 */
export function setActiveFilterTab(tab, context) {
    let filterTabs = {...store.get(FILTER_TAB) || {}};
    filterTabs[context] = tab;
    store.assign(FILTER_TAB, filterTabs);
}


/**
 * Returns the greater version
 *
 * @param versionA
 * @param versionB
 * @returns {number}
 */
export function getMaxVersion(versionA, versionB) {
    return Math.max(parseInt(versionA, 10) || 0, parseInt(versionB, 10) || 0);
}


/**
 * Returns the expiry date: end of the current day
 * @returns {number}
 */
function getExpiryDate() {
    return moment().endOf('day').valueOf();
}


/**
 * Saves active date value until the end of today
 *
 * @param activeDate
 */
export function setActiveDate(activeDate) {
    store.set(ACTIVE_DATE, activeDate, getExpiryDate());
}


/**
 * Returns active date value if not expired
 * @returns {number}
 */
export function getActiveDate() {
    store.removeExpiredKeys();
    return store.get(ACTIVE_DATE);
}


/**
 * Saves given filter and its value until the end of today
 *
 * @param filter
 * @param value
 */
export function setAgendaDropdownFilter(filter, value) {
    const filters = store.get(DROPDOWN_FILTERS) || {};
    filters[filter] = value;
    store.set(DROPDOWN_FILTERS, filters, getExpiryDate());
}


/**
 * Returns filters and values if not expired
 * @returns {object}
 */
export function getAgendaDropdownFilters() {
    store.removeExpiredKeys();
    return store.get(DROPDOWN_FILTERS);
}

/**
 * Clears filters
 * @returns {object}
 */
export function clearAgendaDropdownFilters() {
    store.remove(DROPDOWN_FILTERS);
}