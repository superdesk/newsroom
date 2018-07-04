import { get, isEmpty } from 'lodash';
import moment from 'moment/moment';

const STATUS_CANCELED = 'canceled';
const STATUS_POSTPONED = 'postponed';
const STATUS_RESCHEDULED = 'rescheduled';

const navigationFunctions = {
    'day': {
        'next': getNextDay,
        'previous': getPreviousDay,
        'format': (dateString) => moment(dateString).format('dddd, D MMMM'),
    },
    'week': {
        'next': getNextWeek,
        'previous': getPreviousWeek,
        'format': (dateString) => `${moment(dateString).format('D MMMM')} - 
        ${moment(dateString).add(6, 'days').format('D MMMM')}`,
    },
    'month': {
        'next': getNextMonth,
        'previous': getPreviousMonth,
        'format': (dateString) => moment(dateString).format('MMMM, YYYY'),
    }
};


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
    return !isEmpty(get(item, 'coverages'));
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
    return get(item, 'location.location', null);
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
    return !isEmpty(get(item, 'location'));
}


/**
 * Returns item has contact info
 *
 * @param {Object} item
 * @return {String}
 */
export function hasContact(item) {
    return !isEmpty(get(item, 'event.event_contact_info'));
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
    return !isEmpty(get(item, 'event.links'));
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


/**
 * Format date of a date (without time)
 *
 * @param {String} dateString
 * @return {String}
 */
export function formatNavigationDate(dateString, grouping) {
    return navigationFunctions[grouping].format(dateString);
}


/**
 * Return date formatted for query
 *
 * @param {String} dateString
 * @return {String}
 */
export function getDateInputDate(dateString) {
    if (dateString) {
        const parsed = moment(parseInt(dateString));
        return parsed.format('YYYY-MM-DD');
    }

    return '';
}

/**
 * Gets the next day
 *
 * @param {String} dateString
 * @return {String} number of milliseconds since the Unix Epoch
 */
function getNextDay(dateString) {
    return moment(dateString).add(1, 'days').valueOf();
}


/**
 * Gets the next day
 *
 * @param {String} dateString
 * @return {String} number of milliseconds since the Unix Epoch
 */
function getPreviousDay(dateString) {
    return moment(dateString).add(-1, 'days').valueOf();
}

/**
 * Gets the next week
 *
 * @param {String} dateString
 * @return {String} number of milliseconds since the Unix Epoch
 */
function getNextWeek(dateString) {
    return moment(dateString).add(7, 'days').isoWeekday(1).valueOf();
}


/**
 * Gets the previous week
 *
 * @param {String} dateString
 * @return {String} number of milliseconds since the Unix Epoch
 */
function getPreviousWeek(dateString) {
    return moment(dateString).add(-7, 'days').isoWeekday(1).valueOf();
}

/**
 * Gets the next month
 *
 * @param {String} dateString
 * @return {String} number of milliseconds since the Unix Epoch
 */
function getNextMonth(dateString) {
    return moment(dateString).add(1, 'months').startOf('month').valueOf();
}


/**
 * Gets the previous month
 *
 * @param {String} dateString
 * @return {String} number of milliseconds since the Unix Epoch
 */
function getPreviousMonth(dateString) {
    return moment(dateString).add(-1, 'months').startOf('month').valueOf();
}

/**
 * Calls the next function of a given grouping
 *
 * @param {String} dateString
 * @param {String} grouping: day, week or month
 * @return {String} number of milliseconds since the Unix Epoch
 */
export function getNext(dateString, grouping) {
    return navigationFunctions[grouping].next(dateString);
}


/**
 * Calls the previous function of a given grouping
 *
 * @param {String} dateString
 * @param {String} grouping: day, week or month
 * @return {String} number of milliseconds since the Unix Epoch
 */
export function getPrevious(dateString, grouping) {
    return navigationFunctions[grouping].previous(dateString);
}







