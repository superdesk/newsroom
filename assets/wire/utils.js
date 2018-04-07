import Store from 'store';
import localStorage from 'store/storages/localStorage';
import operationsPlugin from 'store/plugins/operations';

import { get, isEmpty, isEqual, pickBy } from 'lodash';
import { getTextFromHtml } from 'utils';

const STATUS_KILLED = 'canceled';
const READ_ITEMS_STORE = 'read_items';
const NEWS_ONLY_STORE = 'news_only';
const FILTER_TAB = 'filter_tab';

const store = Store.createStore([localStorage], [operationsPlugin]);

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
        store.assign(READ_ITEMS_STORE, {[item._id]: getMaxVersion(state.readItems[item._id], item.version)});
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
 * Get active filter tab
 *
 * @returns {boolean}
 */
export function getActiveFilterTab() {
    return (store.get(FILTER_TAB) || {}).value;
}

/**
 * Set active filter tab
 *
 */
export function setActiveFilterTab(tab) {
    store.assign(FILTER_TAB, {value: tab});
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
 * Returns the item version as integer
 *
 * @param {Object} item
 * @returns {number}
 */
export function getIntVersion(item) {
    if (item) {
        return parseInt(item.version, 10) || 0;
    }
}

/**
 * Get picture for an item
 *
 * if item is picture return it, otherwise look for featuremedia
 *
 * @param {Object} item
 * @return {Object}
 */
export function getPicture(item) {
    return item.type === 'picture' ? item : get(item, 'associations.featuremedia');
}

/**
 * Get picture thumbnail rendition specs
 *
 * @param {Object} picture
 * @param {Boolean} large
 * @return {Object}
 */
export function getThumbnailRendition(picture, large) {
    const rendition = large ? 'renditions._newsroom_thumbnail_large' : 'renditions._newsroom_thumbnail';
    return get(picture, rendition, get(picture, 'renditions.thumbnail'));
}

/**
 * Get picture preview rendition
 *
 * @param {Object} picture
 * @return {Object}
 */
export function getPreviewRendition(picture) {
    return get(picture, 'renditions._newsroom_view', get(picture, 'renditions.viewImage'));
}

/**
 * Get picture detail rendition
 *
 * @param {Object} picture
 * @return {Object}
 */
export function getDetailRendition(picture) {
    return get(picture, 'renditions._newsroom_base', get(picture, 'renditions.baseImage'));
}

/**
 * Test if an item is killed
 *
 * @param {Object} item
 * @return {Boolean}
 */
export function isKilled(item) {
    return item.pubstatus === STATUS_KILLED;
}

/**
 * Test if other item versions should be visible
 *
 * @param {Object} item
 * @param {bool} next toggle if checking for next or previous versions
 * @return {Boolean}
 */
export function showItemVersions(item, next) {
    return !isKilled(item) && (next || item.ancestors && item.ancestors.length);
}

/**
 * Get short text for lists
 *
 * @param {Item} item
 * @return {Node}
 */
export function shortText(item, length=40) {
    const html = item.description_html || item.body_html || '<p></p>';
    const text = item.description_text || getTextFromHtml(html);
    const words = text.split(/\s/).filter((w) => w);
    return words.slice(0, length).join(' ') + (words.length > length ? '...' : '');
}

/**
 * Get caption for picture
 *
 * @param {Object} picture
 * @return {String}
 */
export function getCaption(picture) {
    return getTextFromHtml(picture.body_text || picture.description_text || '').trim();
}

export function getActiveQuery(query, activeFilter, createdFilter) {
    const queryParams = {
        query: query || null,
        filter: pickBy(activeFilter),
        created: pickBy(createdFilter),
    };

    return pickBy(queryParams, (val) => !isEmpty(val));
}

export function isTopicActive(topic, activeQuery) {
    const topicQuery = getActiveQuery(topic.query, topic.filter, topic.created);
    return !isEmpty(activeQuery) && isEqual(topicQuery, activeQuery);
}

/**
 * Test if 2 items are equal
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Boolean}
 */
export function isEqualItem(a, b) {
    return a && b && a._id === b._id && a.version === b.version;
}
