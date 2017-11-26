import React from 'react';
import { Provider } from 'react-redux';
import { createStore as _createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import { render as _render } from 'react-dom';
import alertify from 'alertifyjs';

/**
 * To enable some mocking in tests
 */
export const now = new Date();

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
 * Parse given date string and return Date instance
 *
 * @param {String} dateString
 * @return {Date}
 */
function parseDate(dateString) {
    return new Date(dateString);
}

/**
 * Return date formatted for lists
 *
 * @param {String} dateString
 * @return {String}
 */
export function shortDate(dateString) {
    const date = parseDate(dateString);
    return isToday(date) ? date.toLocaleTimeString() : date.toLocaleDateString();
}

/**
 * Return locale date
 *
 * @param {String} dateString
 * @return {String}
 */
export function getLocaleDate(dateString) {
    return parseDate(dateString).toLocaleDateString();
}

/**
 * Test if given day is today
 *
 * @param {Date} date
 * @return {Boolean}
 */
function isToday(date) {
    return date.getUTCDate() === now.getUTCDate() &&
        date.getUTCMonth() === now.getUTCMonth() &&
        date.getUTCDate() === now.getUTCDate();
}

/**
 * Return full date representation
 *
 * @param {String} dateString
 * @return {String}
 */
export function fullDate(dateString) {
    const date = parseDate(dateString);
    return date.toLocaleString();
}

/**
 * Format time of a date
 *
 * @param {String} dateString
 * @return {String}
 */
export function formatTime(dateString) {
    const date = parseDate(dateString);
    return date.toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit'});
}

/**
 * Format date of a date (without time)
 *
 * @param {String} dateString
 * @return {String}
 */
export function formatDate(dateString) {
    const date = parseDate(dateString);
    return date.toLocaleDateString();
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
 * @param {string} html
 * @return {number}
 */
export function wordCount(html) {
    if (!html) {
        return 0;
    }

    const text = getTextFromHtml(html);
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
