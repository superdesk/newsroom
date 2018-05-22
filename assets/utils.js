import React from 'react';
import { get, isInteger } from 'lodash';
import { Provider } from 'react-redux';
import { createStore as _createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import { render as _render } from 'react-dom';
import alertify from 'alertifyjs';
import moment from 'moment';

export const now = moment(); // to enable mocking in tests
const TIME_FORMAT = getConfig('time_format');
const DATE_FORMAT = getConfig('date_format');
const DATETIME_FORMAT = `${TIME_FORMAT} ${DATE_FORMAT}`;

/**
 * Create redux store with default middleware
 *
 * @param {func} reducer
 * @return {Store}
 */
export function createStore(reducer) {
    const logger = createLogger({
        duration: true,
        collapsed: true,
        timestamp: false,
    });

    return _createStore(reducer, applyMiddleware(thunk, logger));
}

/**
 * Render helper
 *
 * @param {Store} store
 * @param {Component} App
 * @param {Element} element
 */
export function render(store, App, element) {
    return _render(
        <Provider store={store}>
            <App />
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
    let translated = text; // temporary

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
function parseDate(dateString) {
    return moment(dateString);
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
function isToday(date) {
    return date.format('YYYY-MM-DD') === now.format('YYYY-MM-DD');
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
 * Wrapper for alertifyjs
 */
export const notify = {
    success: (message) => alertify.success(message),
    error: (message) => alertify.error(message),
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
    if (isInteger(item.word_count)) {
        return item.word_count;
    }

    if (!item.body_html) {
        return 0;
    }

    const text = getTextFromHtml(item.body_html);
    return text.split(' ').filter(x => x.trim()).length || 0;
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

export function updateRouteParams(updates, state) {
    const params = new URLSearchParams(window.location.search);
    let dirty = false;

    Object.keys(updates).forEach((key) => {
        if (updates[key]) {
            dirty = dirty || updates[key] !== params.get(key);
            params.set(key, updates[key]);
        } else {
            dirty = dirty || params.has(key) || params.entries.length == 0;
            params.delete(key);
        }
    });

    if (dirty) {
        history.pushState(state, null, '?' + params.toString());
    }
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
    return get(window.newsroom, key, defaultValue);
}

export function getTimezoneOffset() {
    return now.utcOffset() ? now.utcOffset() * -1 : 0; // it's oposite to Date.getTimezoneOffset
}

export function isTouchDevice() {
    return 'ontouchstart' in window        // works on most browsers
    || navigator.maxTouchPoints;       // works on IE10/11 and Surface
}