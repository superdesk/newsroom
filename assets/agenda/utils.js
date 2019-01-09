import { get, isEmpty, includes, keyBy, sortBy } from 'lodash';
import moment from 'moment/moment';
import {formatDate, formatMonth, formatWeek, getConfig, gettext, DATE_FORMAT} from '../utils';

const STATUS_KILLED = 'killed';
const STATUS_CANCELED = 'cancelled';
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

const Groupers = {
    'day': formatDate,
    'week': formatWeek,
    'month': formatMonth,
};

export function getCoverageStatusText(coverage) {
    if (coverage.workflow_status === 'draft') {
        return get(DRAFT_STATUS_TEXTS, coverage.coverage_status, '');
    }

    return get(WORKFLOW_STATUS_TEXTS, coverage.workflow_status, '');
}

export const DRAFT_STATUS_TEXTS = {
    'coverage not planned': gettext('not planned'),
    'coverage intended': gettext('planned'),
    'coverage not decided': gettext('on merit'),
    'coverage not decided yet': gettext('on merit'),
    'coverage upon request': gettext('on request'),
};

export const WORKFLOW_STATUS_TEXTS = {
    assigned: gettext('planned'),
    active: gettext('in progress'),
    completed: gettext('available'),
    cancelled: gettext('cancelled'),
};

export const WORKFLOW_COLORS = {
    draft: 'icon--gray-light',
    assigned: 'icon--mid-blue-light',
    active: 'icon--cyan',
    completed: 'icon--green',
    cancelled: 'icon--red',
};


/**
 * Early enough date to use in querying all agenda items
 * @type {number}
 */
export const EARLIEST_DATE = moment('20170101').valueOf();

/**
 * Test if an item is canceled or killed
 *
 * @param {Object} item
 * @return {Boolean}
 */
export function isCanceled(item) {
    return item && (item.state === STATUS_CANCELED || item.state === STATUS_KILLED);
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
 * Returns icon name of the given coverage type
 *
 * @param coverageType
 * @returns {*}
 */
export function getCoverageIcon(coverageType) {
    const coverageTypes = getConfig('coverage_types', {});
    return get(coverageTypes, `${coverageType}.icon`, 'unrecognized');
}

/**
 * Returns display name of the given coverage type
 *
 * @param coverageType
 * @returns {*}
 */
export function getCoverageDisplayName(coverageType) {
    const coverageTypes = getConfig('coverage_types', {});
    return get(coverageTypes, `${coverageType}.name`, coverageType);
}

/**
 * Test if an item is watched
 *
 * @param {Object} item
 * @param {String} userId
 * @return {Boolean}
 */
export function isWatched(item, userId) {
    return userId && includes(get(item, 'watches', []), userId);
}


/**
 * Test if a coverage is in boundary of event start and end dates
 *
 * @param {Object} item
 * @param {Object} coverage
 * @return {Boolean}
 */
export function isCoverageBetweenEventDates(item, coverage) {
    const coverageDate = moment(coverage.scheduled);
    const eventStartDate = moment(item.dates.start);
    const eventEndDate = moment(get(item, 'dates.end', eventStartDate));
    return coverageDate.isBetween(eventStartDate, eventEndDate, null, '[]');
}

/**
 * Test if a coverage is for given date string
 *
 * @param {Object} coverage
 * @param {String} dateString
 * @return {Boolean}
 */
export function isCoverageForExtraDay(coverage, dateString) {
    return formatDate(moment(coverage.scheduled)) === dateString;
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
 * Returns item address in string
 *
 * @param {Object} item
 * @return {String}
 */
export function getLocationString(item) {
    return [
        get(item, 'location.0.name', get(item, 'location.0.address.title')),
        get(item, 'location.0.address.line.0'),
        get(item, 'location.0.address.area'),
        get(item, 'location.0.address.locality'),
        get(item, 'location.0.address.postal_code'),
        get(item, 'location.0.address.country'),
    ].filter((d) => d).join(', ');
}

/**
 * Returns item has location info
 *
 * @param {Object} item
 * @return {Boolean}
 */
export function hasLocation(item) {
    return !!getLocationString(item);
}

/**
 * Returns public contacts
 *
 * @param {Object} item
 * @return {String}
 */
export function getPublicContacts(item) {
    const contacts = get(item, 'event.event_contact_info', []);
    return contacts.filter(c => c.public).map(c => ({
        name: [c.first_name, c.last_name].filter((x) => !!x).join(' '),
        organisation: c.organisation || '',
        email: (c.contact_email || []).join(', '),
        phone: (c.contact_phone || []).filter(m => m.public).map(m => m.number).join(', '),
        mobile: (c.mobile || []).filter(m => m.public).map(m => m.number).join(', '),
    }));
}

/**
 * Returns item calendars
 *
 * @param {Object} item
 * @return {String}
 */
export function getCalendars(item) {
    return get(item, 'calendars', []).map(cal => cal.name).join(', ');
}



/**
 * Returns item event link
 *
 * @param {Object} item
 * @return {String}
 */
export function getEventLinks(item) {
    return get(item, 'event.links', []);
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
 * Gets the previous day
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
export function getPreviousMonth(dateString) {
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

/**
 * Get agenda item attachments
 * 
 * @param {Object} item
 * @return {Array}
 */
export function getAttachments(item) {
    return get(item, 'event.files', []);
}

/**
 * Get list of internal notes
 *
 * @param {Object} item
 * @return {Array}
 */
export function getInternalNote(item, plan) {
    return get(plan, 'internal_note') || get(item, 'internal_note');
}

/**
 * Get internal notes per coverage
 *
 * @param {Object} item
 * @return {Object}
 */
export function getInternalNotesFromCoverages(item) {
    const internalNotes = {};
    const planningItems = get(item, 'planning_items', []);
    planningItems.forEach(p => get(p, 'coverages', []).forEach(c => {
        internalNotes[c.coverage_id] = get(c, 'planning.internal_note');
    }));
    return internalNotes;
}

/**
 * Get list of subjects
 *
 * @param {Object} item
 * @return {Array}
 */
export function getSubjects(item) {
    return get(item, 'subject') || [];
}

/**
 * Test if item has any attachments
 * 
 * @param {Object} item
 * @return {Boolean}
 */
export function hasAttachments(item) {
    return !isEmpty(getAttachments(item));
}

/**
 * Get agenda item name
 *
 * @param {Object} item
 * @return {String}
 */
export function getName(item) {
    return item.name || item.slugline || item.headline;
}

/**
 * Get agenda item description
 *
 * @param {Object} item
 * @param {Object} plan
 * @return {String}
 */
export function getDescription(item, plan) {
    return plan.description_text || item.definition_short;
}


/**
 * Gets the extra days outside the event days
 *
 * @param {Object} item
 * @return {Array} list of dates
 */
export function getExtraDates(item) {
    return get(item, 'display_dates', []).map(ed => moment(ed.date));
}

/**
 * Checks if a date is in extra dates
 *
 * @param {Object} item
 * @param {Date} date to check (moment)
 * @return {Boolean}
 */
export function containsExtraDate(item, dateToCheck) {
    return get(item, 'display_dates', []).map(ed => moment(ed.date).format('YYYY-MM-DD')).includes(dateToCheck.format('YYYY-MM-DD'));
}


/**
 * Groups given agenda items per given grouping
 * @param items: list of agenda items
 * @param activeDate: date that the grouping will start from
 * @param activeGrouping: type of grouping i.e. day, week, month
 */
export function groupItems (items, activeDate, activeGrouping) {
    const maxStart = moment(activeDate).set({'h': 0, 'm': 0, 's': 0});
    const groupedItems = {};
    const grouper = Groupers[activeGrouping];

    items.forEach((item) => {
        const itemExtraDates = getExtraDates(item);
        const itemStartDate = moment(item.dates.start);

        const start = item._display_from ? moment(item._display_from) :
            moment.max(maxStart, moment.min(itemExtraDates.concat([itemStartDate])));

        const itemEndDate = moment(get(item, 'dates.end', start));

        const end = item._display_to ? moment(item._display_to) :
            moment.max(itemExtraDates.concat([maxStart]).concat([itemEndDate]));
        let key = null;

        // use clone otherwise it would modify start and potentially also maxStart, moments are mutable
        for (const day = start.clone(); day.isSameOrBefore(end, 'day'); day.add(1, 'd')) {

            const isBetween = day.isBetween(itemStartDate, itemEndDate, 'day', '[]');
            const containsExtra = containsExtraDate(item, day);
            const addGroupItem = (item.event && (isBetween || containsExtra)) || containsExtra;

            if (grouper(day) !== key && addGroupItem) {
                key = grouper(day);
                const groupList = groupedItems[key] || [];
                groupList.push(item._id);
                groupedItems[key] = groupList;
            }
        }
    });

    return sortBy(
        Object.keys(groupedItems).map((k) => (
            {
                date: k,
                items: groupedItems[k],
                _sortDate: moment(k, DATE_FORMAT)
            })),
        (g) => g._sortDate);
}

/**
 * Get Planning Item for the day
 * @param item: Agenda item
 * @param group: Group Date
 */
export function getPlanningItemsByGroup(item, group) {
    if (get(item, 'planning_items.length', 0) === 0) {
        return [];
    }

    if (get(item, 'coverages.length', 0) === 0) {
        return [];
    }

    const allPlans = keyBy(get(item, 'planning_items'), '_id');
    const processed = {};

    // get unique plans for that group based on the coverage.
    const plans = item.coverages
        .map((coverage) => {
            if (isCoverageForExtraDay(coverage, group)) {
                if (!processed[coverage.planning_id]) {
                    processed[coverage.planning_id] = 1;
                    return allPlans[coverage.planning_id];
                }
                return null;
            }
            return null;
        })
        .filter((p) => p);

    if (plans.length === 0) {
        return [];
    }

    return plans;
}

export function isCoverageOnPreviousDay(coverage, group) {
    return moment(coverage.scheduled).isBefore(moment(group, DATE_FORMAT), 'day');
}


export function getCoveragesForDisplay(item, plan, group) {
    const currentCoverage = [];
    const previousCoverage = [];
    // get current and preview coverages
    (get(item, 'coverages') || [])
        .forEach((coverage) => {
            if (coverage.planning_id === get(plan, 'guid')) {
                if (isCoverageForExtraDay(coverage, group)) {
                    currentCoverage.push(coverage);
                } else if (isCoverageOnPreviousDay(coverage, group)) {
                    previousCoverage.push(coverage);
                }
            }
        });

    return {current: currentCoverage, previous: previousCoverage};
}

export function getListItems(groups, itemsById) {
    const listItems = [];

    groups.forEach((group) => {
        group.items.forEach((_id) => {
            const plans = getPlanningItemsByGroup(itemsById[_id], group.date);
            // console.log(plans);
            if (plans.length > 0) {
                plans.forEach((plan) => {
                    listItems.push({_id, group: group.date, plan});
                });
            } else {
                listItems.push({_id, group: group.date, plan: null});
            }
        });
    });
    return listItems;
}