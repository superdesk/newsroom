/**
 * Get picture for an item
 *
 * @param {Object} item
 * @return {Object}
 */
export function getPicture(item) {
    return item.associations && item.associations.featuremedia;
}
