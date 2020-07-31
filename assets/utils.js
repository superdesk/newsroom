import React from 'react';
import server from 'server';
import analytics from 'analytics';
import { get, isInteger, keyBy, isEmpty, cloneDeep, throttle } from 'lodash';
import { Provider } from 'react-redux';
import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import { render as _render } from 'react-dom';
import alertify from 'alertifyjs';
import moment from 'moment-timezone';
import {
    hasCoverages,
    isCoverageForExtraDay,
    SCHEDULE_TYPE,
    isItemTBC,
    TO_BE_CONFIRMED_TEXT
} from './agenda/utils';

export const now = moment(); // to enable mocking in tests
const NEWSROOM = 'newsroom';
const CLIENT_CONFIG = 'client_config';

function getLocaleFormat(formatType) {
    const formats = getConfig('locale_formats', {});
    const locale = getLocale();

    if (formats[locale] && formats[locale][formatType]) {
        return formats[locale][formatType];
    }

    const defaultLanguage = getConfig('default_language', 'en');

    if (formats[defaultLanguage] && formats[defaultLanguage][formatType]) {
        return formats[defaultLanguage][formatType];
    }

    return 'DD-MM-YYYY';
}

const getTimeFormat = () => getLocaleFormat('TIME_FORMAT');
const getDateFormat = () => getLocaleFormat('DATE_FORMAT');
const getCoverageDateTimeFormat = () =>
    getLocaleFormat('COVERAGE_DATE_TIME_FORMAT');
const getCoverageDateFormat = () => getLocaleFormat('COVERAGE_DATE_FORMAT');

export const TIME_FORMAT = getTimeFormat();
export const DATE_FORMAT = getDateFormat();
export const COVERAGE_DATE_TIME_FORMAT = getCoverageDateTimeFormat();
export const COVERAGE_DATE_FORMAT = getCoverageDateFormat();
const DATETIME_FORMAT = `${TIME_FORMAT} ${DATE_FORMAT}`;

export const SERVER_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss+0000';
export const DAY_IN_MINUTES = 24 * 60 - 1;
export const LIST_ANIMATIONS = getConfig('list_animations', true);
export const DISPLAY_NEWS_ONLY = getConfig('display_news_only', true);
export const DEFAULT_TIMEZONE = getConfig('default_timezone', 'Australia/Sydney');
export const KEYCODES = {
    ENTER: 13,
    DOWN: 40,
};



/**
 * Create redux store with default middleware
 *
 * @param {func} reducer
 * @param {String} name
 * @return {Store}
 */
export function createStore(reducer, name = 'default') {
    // https://redux.js.org/api-reference/compose
    let _compose = compose;
    const middlewares = [
        thunk
    ];

    if (getConfig('debug')) {
        // activate logs actions for non production instances.
        // (this should always be the last middleware)
        middlewares.push(
            createLogger({
                duration: true,
                collapsed: true,
                timestamp: false,
                titleFormatter: (action, time, took) => (
                    // Adds the name of the store to the console logs
                    // derived based on the defaultTitleFormatter from redux-logger
                    // https://github.com/LogRocket/redux-logger/blob/master/src/core.js#L25
                    (action && action.type) ?
                        `${name} - action ${String(action.type)} (in ${took.toFixed(2)} ms)` :
                        `${name} - action (in ${took.toFixed(2)} ms)`
                ),
            })
        );
        // activate redux devtools for non production instances,
        // if it's available in the browser
        // https://github.com/zalmoxisus/redux-devtools-extension
        if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
            _compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
        }
    }

    return _createStore(reducer, _compose(applyMiddleware(...middlewares)));
}

/**
 * Render helper
 *
 * @param {Store} store
 * @param {Component} App
 * @param {Element} element
 */
export function render(store, App, element, props) {
    return _render(
        <Provider store={store}>
            <App {...props}/>
        </Provider>,
        element
    );
}

/**
 * Noop for now, but it's better to use it from beginning.
 *
 * It handles interpolation:
 *
 * gettext('Hello {{ name }}', {name: 'John'});
 *
 * @param {String} text
 * @param {Object} params
 * @return {String}
 */
export function gettext(text, params) {
    let translated = get(window.translations, text, text);

    if (params) {
        Object.keys(params).forEach((param) => {
            const paramRegexp = new RegExp('{{ ?' + param + ' ?}}', 'g');
            translated = translated.replace(paramRegexp, params[param] || '');
        });
    }

    return translated;
}

/**
 * Returns query string query for a given product
 *
 * @param {Object} product
 * @return {string}
 */
export function getProductQuery(product) {
    let q = product.sd_product_id ? `products.code:${product.sd_product_id}` : '';
    q += product.query ? product.sd_product_id ? ` OR (${product.query})` : product.query : '';
    return q;
}

/**
 * Parse given date string and return Date instance
 *
 * @param {String} dateString
 * @return {Date}
 */
export function parseDate(dateString) {
    return moment(dateString);
}

/**
 * Parse the given date string and return moment instance in the timezone provided
 * If no timezone is provided, then it will default to the browser's timezone
 * @param {String} dateString - The datetime string to convert
 * @param {String} timezone - The name of the timezone region, i.e. Australia/Sydney
 * @returns {moment}
 */
export function parseDateInTimezone(dateString, timezone = null) {
    return moment.tz(dateString, timezone || moment.tz.guess());
}

/**
 * Return date formatted for lists
 *
 * @param {String} dateString
 * @return {String}
 */
export function shortDate(dateString) {
    const parsed = parseDate(dateString);
    return parsed.format(isToday(parsed) ? TIME_FORMAT : DATE_FORMAT);
}

/**
 * Return date formatted for date inputs
 *
 * @param {String} dateString
 * @return {String}
 */
export function getDateInputDate(dateString) {
    if (dateString) {
        const parsed = parseDate(dateString);
        return parsed.format('YYYY-MM-DD');
    }

    return '';
}

/**
 * Return locale date
 *
 * @param {String} dateString
 * @return {String}
 */
export function getLocaleDate(dateString) {
    return parseDate(dateString).format(DATETIME_FORMAT);
}

/**
 * Test if given day is today
 *
 * @param {Date} date
 * @return {Boolean}
 */
export function isToday(date) {
    const parsed = typeof date === 'string' ? parseDate(date) : date;
    return parsed.format('YYYY-MM-DD') === now.format('YYYY-MM-DD');
}


/**
 * Test if given day is in the past
 * If no timezone is provided, then it will default to the browser's timezone
 *
 * @param {String} dateString - The datetime string to check
 * @param {String} timezone - The name of the timezone region, i.e. Australia/Sydney
 * @return {Boolean}
 */
export function isInPast(dateString, timezone) {
    if(!dateString) {
        return false;
    }

    return parseDateInTimezone(dateString, timezone).isSameOrBefore(
        now.tz(timezone || moment.tz.guess()),
        'day'
    );
}

/**
 * Return full date representation
 *
 * @param {String} dateString
 * @return {String}
 */
export function fullDate(dateString) {
    return parseDate(dateString).format(DATETIME_FORMAT);
}

/**
 * Format time of a date
 *
 * @param {String} dateString
 * @return {String}
 */
export function formatTime(dateString) {
    return parseDate(dateString).format(TIME_FORMAT);
}

/**
 * Format date of a date (without time)
 *
 * @param {String} dateString
 * @return {String}
 */
export function formatDate(dateString) {
    return parseDate(dateString).format(DATE_FORMAT);
}

/**
 * Parse the given date string, setting the time to 23:59:59 (i.e. end of the day).
 * Ensures that the datetime is for the end of the day in the provided timezone
 * If no timezone is provided, then it will default to the browser's timezone
 * @param {String} dateString - The date string to convert (in the format 'YYYY-MM-DD')
 * @param {String} timezone - The name of the timezone region, i.e. Australia/Sydney
 * @returns {moment}
 */
export function getEndOfDayFromDate(dateString, timezone = null) {
    return parseDateInTimezone(dateString + 'T23:59:59', timezone);
}

/**
 * Parse the given datetime string and timezone and converts it to utc
 * If no timezone is provided, then it will default to the browser's timezone
 * @param {String} datetime - The datetime string
 * @param {String} timezone - The name of the timezone region, i.e. Australia/Sydney
 * @returns {moment}
 */
export function convertUtcToTimezone(datetime, timezone) {
    return parseDateInTimezone(datetime, 'utc')
        .tz(timezone);
}

export function getScheduleType(item) {
    const start = moment(item.dates.start);
    const end = moment(item.dates.end);
    const duration = end.diff(start, 'minutes');
    if (duration > DAY_IN_MINUTES || !start.isSame(end, 'day')) {
        return SCHEDULE_TYPE.MULTI_DAY;
    }

    if (duration === DAY_IN_MINUTES && start.isSame(end, 'day')) {
        return SCHEDULE_TYPE.ALL_DAY;
    }

    if (duration === 0) {
        return SCHEDULE_TYPE.NO_DURATION;
    }

    return SCHEDULE_TYPE.REGULAR;
}

/**
 * Format agenda item start and end dates
 *
 * @param {String} dateString
 * @param {String} group: date of the selected event group
 * @return {Array} [time string, date string]
 */
export function formatAgendaDate(item, group, localTimeZone = true) {

    const getFormattedTimezone = (date) => {
        let tzStr = date.format('z');
        if (tzStr.indexOf('+0') >= 0) {
            return tzStr.replace('+0', 'GMT+');
        }

        if (tzStr.indexOf('+') >= 0) {
            return tzStr.replace('+', 'GMT+');
        }

        return tzStr;
    };

    const isTBCItem = isItemTBC(item);
    let start = parseDate(item.dates.start);
    let end = parseDate(item.dates.end);
    let duration = end.diff(start, 'minutes');
    let dateGroup = group ? moment(group, DATE_FORMAT) : null;
    let dateTimeString = localTimeZone ? [] : [`(${getFormattedTimezone(start)} `];

    let isGroupBetweenEventDates = dateGroup ?
        start.isSameOrBefore(dateGroup, 'day') && end.isSameOrAfter(dateGroup, 'day') : true;

    if (!isGroupBetweenEventDates && hasCoverages(item)) {
        // we rendering for extra days
        const scheduleDates = item.coverages
            .map((coverage) => {
                if (isCoverageForExtraDay(coverage, group)) {
                    return coverage.scheduled;
                }
                return null;
            })
            .filter((d) => d)
            .sort((a, b) => {
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
            });
        if (scheduleDates.length > 0) {
            duration = 0;
            start = moment(scheduleDates[0]);
        }
    }

    const scheduleType = getScheduleType(item);
    let regulartTimeStr = `${formatTime(start)} - ${formatTime(end)} `;
    if (isTBCItem) {
        regulartTimeStr = localTimeZone ? `${TO_BE_CONFIRMED_TEXT} ` : '';
    }
    if (duration === 0 || scheduleType === SCHEDULE_TYPE.NO_DURATION) {
        dateTimeString.push(isTBCItem ? `${regulartTimeStr}` : `${formatTime(start)}`);
    } else {
        switch(scheduleType) {
        case SCHEDULE_TYPE.MULTI_DAY:
            if (isTBCItem) {
                dateTimeString.push(`${formatDate(start)} to ${formatDate(end)}`);
            } else {
                dateTimeString.push(`${formatTime(start)} ${formatDate(start)} to ${formatTime(end)} ${formatDate(end)}`);
            }
            break;

        case SCHEDULE_TYPE.ALL_DAY:
            dateTimeString.push(formatDate(start));
            break;

        case SCHEDULE_TYPE.REGULAR:
            if (localTimeZone) {
                dateTimeString.push(regulartTimeStr);
            } else {
                dateTimeString.push(`${regulartTimeStr}${formatDate(start)}`);
            }
            break;
        }
    }

    if (!localTimeZone) {
        dateTimeString[dateTimeString.length - 1] = dateTimeString[dateTimeString.length - 1] + ')';
    }

    return dateTimeString;
}

/**
 * Format week of a date (without time)
 *
 * @param {String} dateString
 * @return {String}
 */
export function formatWeek(dateString) {
    const startDate = parseDate(dateString).isoWeekday(1);
    const endDate = parseDate(dateString).isoWeekday(7);
    return `${startDate.format(DATE_FORMAT)} - ${endDate.format(DATE_FORMAT)}`;
}

/**
 * Format month of a date (without time)
 *
 * @param {String} dateString
 * @return {String}
 */
export function formatMonth(dateString) {
    return parseDate(dateString).format('MMMM');
}

/**
 * Wrapper for alertifyjs
 */
export const notify = {
    success: (message) => alertify.success(message),
    error: (message) => alertify.error(message),
    warning: (message) => alertify.warning(message),
};

/**
 * Get text from html
 *
 * @param {string} html
 * @return {string}
 */
export function getTextFromHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = formatHTML(html);
    const tree = document.createTreeWalker(div, NodeFilter.SHOW_TEXT, null, false); // ie requires all params
    const text = [];
    while (tree.nextNode()) {
        text.push(tree.currentNode.textContent);
        if (tree.currentNode.nextSibling) {
            switch(tree.currentNode.nextSibling.nodeName) {
            case 'BR':
            case 'HR':
                text.push('\n');
            }

            continue;
        }

        switch (tree.currentNode.parentNode.nodeName) {
        case 'P':
        case 'LI':
        case 'H1':
        case 'H2':
        case 'H3':
        case 'H4':
        case 'H5':
        case 'DIV':
        case 'TABLE':
        case 'BLOCKQUOTE':
            text.push('\n');
        }
    }

    return text.join('');
}

/**
 * Get word count for given item
 *
 * @param {Object} item
 * @return {number}
 */
export function wordCount(item) {
    if (isInteger(item.wordcount)) {
        return item.wordcount;
    }

    if (!item.body_html) {
        return 0;
    }

    const text = getTextFromHtml(item.body_html);
    return text.split(' ').filter(x => x.trim()).length || 0;
}

/**
 * Get character count for given item
 *
 * @param {Object} item
 * @return {number}
 */
export function characterCount(item) {

    if (isInteger(item.charcount)) {
        return item.charcount;
    }

    if (!item.body_html) {
        return 0;
    }

    const text = getTextFromHtml(item.body_html);

    // Ignore the last line break
    return text.length - 1 ;
}

/**
 * Toggle value within array
 *
 * returns a new array so can be used with setState
 *
 * @param {Array} items
 * @param {mixed} value
 * @return {Array}
 */
export function toggleValue(items, value) {
    if (!items) {
        return [value];
    }

    const without = items.filter((x) => value !== x);
    return without.length === items.length ? without.concat([value]) : without;
}


export function updateRouteParams(updates, state, deleteEmpty = true) {
    const params = new URLSearchParams(window.location.search);

    Object.keys(updates).forEach((key) => {
        let updatedValue = updates[key];
        if (!deleteEmpty || !isEmpty(updatedValue) || typeof updatedValue === 'boolean') {
            if (typeof updatedValue === 'object') {
                updatedValue = JSON.stringify(updatedValue);
            }
            params.set(key, updatedValue);
        } else {
            params.delete(key);
        }
    });

    const stateClone = cloneDeep(state);
    stateClone.items = [];
    stateClone.itemsById = {};
    history.pushState(stateClone, null, `?${params.toString()}`);
}

const SHIFT_OUT_REGEXP = new RegExp(String.fromCharCode(14), 'g');

/**
 * Replace some white characters in html
 *
 * @param {String} html
 * @return {String}
 */
export function formatHTML(html) {
    return html.replace(SHIFT_OUT_REGEXP, html.indexOf('<pre>') === -1 ? '<br>' : '\n');
}

/**
 * Initializes the web socket listener
 * @param store
 */
export function initWebSocket(store, action) {
    if (window.newsroom) {
        const ws = new WebSocket(window.newsroom.websocket);
        ws.onmessage = (message) => {
            const data = JSON.parse(message.data);
            if (data.event) {
                store.dispatch(action(data));
            }
        };
    }
}

/**
 * Generic error handler for http requests
 * @param error
 * @param dispatch
 * @param setError
 */
export function errorHandler(error, dispatch, setError) {
    console.error('error', error);

    if (error.response.status !== 400) {
        notify.error(error.response.statusText);
        return;
    }
    if (setError) {
        error.response.json().then(function(data) {
            dispatch(setError(data));
        });
    }
}

/**
 * Get config value
 *
 * @param {String} key
 * @param {Mixed} defaultValue
 * @return {Mixed}
 */
export function getConfig(key, defaultValue) {
    const clientConfig = get(window, `${NEWSROOM}.${CLIENT_CONFIG}`, {});
    return get(clientConfig, key, defaultValue);
}

export function getLocale() {
    const defaultLanguage = getConfig('default_language');
    const locale = get(window, 'locale', defaultLanguage);

    return locale;
}

export function getTimezoneOffset() {
    return now.utcOffset() ? now.utcOffset() * -1 : 0; // it's oposite to Date.getTimezoneOffset
}

export function isTouchDevice() {
    return 'ontouchstart' in window        // works on most browsers
    || navigator.maxTouchPoints;       // works on IE10/11 and Surface
}

export function isMobilePhone() {
    return isTouchDevice() && screen.width < 768;
}

/**
 * Checks if wire context
 * @returns {boolean}
 */
export function isWireContext() {
    return window.location.pathname.includes('/wire');
}

export const getInitData = (data) => {
    let initData = data || {};
    return {
        ...initData,
        userSections: keyBy(get(window.profileData, 'userSections', {}), '_id')
    };
};

export const isDisplayed = (field, config) => get(config, `${field}.displayed`, true);

const getNow = throttle(moment, 500);

/**
 * Test if item is embargoed, if not returns null, otherwise returns its embargo time
 * @param {String} embargoed
 * @return {Moment}
 */
export function getEmbargo(item) {
    if (!item.embargoed) {
        return null;
    }

    const now = getNow();
    const parsed = moment(item.embargoed);

    return parsed.isAfter(now) ? parsed : null;
}

export function getItemFromArray(value, items = [], field = '_id') {
    return items.find((i) => i[field] === value);
}

export function upperCaseFirstCharacter(text) {
    return (text && text.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()));
}

export function postHistoryAction(item, action, section='wire') {
    server.post('/history/new', {
        item: item,
        action: action,
        section: section
    }).catch((error) => errorHandler(error));
}

export function recordAction(item, action = 'open', section = 'wire', state = null) {
    if (item) {
        analytics.itemEvent(action, item);
        analytics.itemView(item);
        postHistoryAction(item, action, section);

        if (action === 'preview') {
            updateRouteParams({}, {
                ...state,
                previewItem: get(item, '_id')
            });
        }
    }
}

export function closeItemOnMobile(dispatch, state, openItemDetails, previewItem) {
    if (isMobilePhone()) {
        dispatch(openItemDetails(null));
        dispatch(previewItem(null));
    }
}

/**
 * Get the slugline appended by the takekey if one is defined
 * @param {Object} item - The wire item to get the slugline from
 * @param {boolean} withTakeKey - If true, appends the takekey to the response
 * @returns {String}
 */
export function getSlugline(item, withTakeKey = false) {
    if (!item || !item.slugline) {
        return '';
    }

    let slugline = item.slugline.trim();
    const takeKey = ` | ${item.anpa_take_key}`;

    if (withTakeKey && item.anpa_take_key && !slugline.endsWith(takeKey)) {
        slugline += takeKey;
    }

    return slugline;
}
