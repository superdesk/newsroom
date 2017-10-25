const STATUS_KILLED = 'canceled';

/**
 * Get picture for an item
 *
 * @param {Object} item
 * @return {Object}
 */
export function getPicture(item) {
    return item.associations && item.associations.featuremedia;
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
 * @return {Boolean}
 */
export function showItemVersions(item) {
    return item.ancestors && item.ancestors.length && !isKilled(item);
}
