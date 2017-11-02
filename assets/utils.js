import React from 'react';
import { Provider } from 'react-redux';
import { createStore as _createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import { render as _render } from 'react-dom';
import alertify from 'alertifyjs';

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
    return date.toLocaleString();
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
function getTextFromHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
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
            dirty = dirty || params.has(key);
            params.delete(key);
        }
    });

    if (dirty) {
        history.pushState(state, null, '?' + params.toString());
    }
}
