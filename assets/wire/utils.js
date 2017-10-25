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
 * Test if item previous versions should be visible
 */
export function showPreviousVersions(item) {
    return item.ancestors && item.ancestors.length && item.pubstate !== 'canceled';
}
