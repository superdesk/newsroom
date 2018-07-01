import { get } from 'lodash';

const STATUS_CANCELED = 'canceled';
const STATUS_POSTPONED = 'postponed';
const STATUS_RESCHEDULED = 'rescheduled';


/**
 * Test if an item is canceled
 *
 * @param {Object} item
 * @return {Boolean}
 */
export function isCanceled(item) {
    return item && item.state === STATUS_CANCELED;
}

/**
 * Test if an item is postponed
 *
 * @param {Object} item
 * @return {Boolean}
 */
export function isPostponed(item) {
    return item && item.state === STATUS_POSTPONED;
}

/**
 * Test if an item is rescheduled
 *
 * @param {Object} item
 * @return {Boolean}
 */
export function isRescheduled(item) {
    return item && item.state === STATUS_RESCHEDULED;
}

/**
 * Test if an item has coverages
 *
 * @param {Object} item
 * @return {Boolean}
 */
export function hasCoverages(item) {
    return item && item.coverages && item.coverages.length;
}

/**
 * Test if an item is recurring
 *
 * @param {Object} item
 * @return {Boolean}
 */
export function isRecurring(item) {
    return item && !!item.recurrence_id;
}

/**
 * Returns item Geo location in lat and long
 *
 * @param {Object} item
 * @return {String}
 */
export function getGeoLocation(item) {
    get(item, 'location.location', null);
}

/**
 * Returns item location in string
 *
 * @param {Object} item
 * @return {String}
 */
export function getLocationString(item) {
    if (hasLocation(item)) {
        return item.location[0].name;
        // return `${item.location[0].title}, ${get(item.location[0], 'address.line')} ${get(item.location[0], 'address.country')}`;
    }
}

/**
 * Returns item has location info
 *
 * @param {Object} item
 * @return {String}
 */
export function hasLocation(item) {
    return item && item.location && item.location.length;
}


/**
 * Returns item has contact info
 *
 * @param {Object} item
 * @return {String}
 */
export function hasContact(item) {
    return item && item.event && item.event.event_contact_info && item.event.event_contact_info.length;
}

/**
 * Returns item has contact name
 *
 * @param {Object} item
 * @return {String}
 */
export function getContactName(item) {
    if (hasContact(item)) {
        const contact = get(item, 'event.event_contact_info');
        return `${contact[0].first_name} ${contact[0].last_name}`;
    }
}

/**
 * Returns item has contact number
 *
 * @param {Object} item
 * @return {String}
 */
export function getContactNumber(item) {
    if (hasContact(item)) {
        const contact = get(item, 'event.event_contact_info');
        const mobile = contact[0].mobile;
        const telephone = contact[0].contact_phone;
        return mobile.length > 0 ? mobile[0].number : telephone.length > 0 ? telephone[0].number : '';
    }
}

/**
 * Returns item has contact email
 *
 * @param {Object} item
 * @return {String}
 */
export function getContactEmail(item) {
    if (hasContact(item)) {
        const contact = get(item, 'event.event_contact_info');
        return contact[0].contact_email;
    }
}

/**
 * Returns item has event link
 *
 * @param {Object} item
 * @return {String}
 */
export function hasEventLink(item) {
    return item && item.event && item.event.links && item.event.links.length;
}


/**
 * Returns item event link
 *
 * @param {Object} item
 * @return {String}
 */
export function getEventLink(item) {
    const links = get(item, 'event.links', []);
    if (links.length) {
        return links[0];
    }
    return null;
}






