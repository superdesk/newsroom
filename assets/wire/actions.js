
import server from 'server';
import { gettext, notify } from 'utils';

export const SET_STATE = 'SET_STATE';
export function setState(state) {
    return {type: SET_STATE, state};
}

export const SET_ITEMS = 'SET_ITEMS';
export function setItems(items) {
    return {type: SET_ITEMS, items};
}

export const SET_ACTIVE = 'SET_ACTIVE';
export function setActive(item) {
    return {type: SET_ACTIVE, item};
}

export const PREVIEW_ITEM = 'PREVIEW_ITEM';
export function previewItem(item) {
    return {type: PREVIEW_ITEM, item};
}

export const SET_QUERY = 'SET_QUERY';
export function setQuery(query) {
    return {type: SET_QUERY, query};
}

export const QUERY_ITEMS = 'QUERY_ITEMS';
export function queryItems() {
    return {type: QUERY_ITEMS};
}

export const RECIEVE_ITEMS = 'RECIEVE_ITEMS';
export function recieveItems(data) {
    return {type: RECIEVE_ITEMS, data};
}

export const RENDER_MODAL = 'RENDER_MODAL';
export function renderModal(modal, data) {
    return {type: RENDER_MODAL, modal, data};
}

export const CLOSE_MODAL = 'CLOSE_MODAL';
export function closeModal() {
    return {type: CLOSE_MODAL};
}

export const INIT_DATA = 'INIT_DATA';
export function initData(data) {
    return {type: INIT_DATA, data};
}

export const ADD_TOPIC = 'ADD_TOPIC';
export function addTopic(topic) {
    return {type: ADD_TOPIC, topic};
}

/**
 * Copy contents of item preview.
 *
 * This is an initial version, should be updated with preview markup changes.
 */
export function copyPreviewContents() {
    const preview = document.getElementById('preview-article');
    const selection = window.getSelection();
    const range = document.createRange();
    selection.removeAllRanges();
    range.selectNode(preview);
    selection.addRange(range);
    if (document.execCommand('copy')) {
        notify.success(gettext('Item copied successfully.'));
    } else {
        notify.error(gettext('Sorry, Copy is not supported.'));
    }
    selection.removeAllRanges();
}

/**
 * Fetch items for current query
 */
export function fetchItems() {
    return (dispatch, getState) => {
        dispatch(queryItems());
        const query = getState().query || '';
        return server.get(`/search?q=${query}`)
            .then((data) => dispatch(recieveItems(data)))
            .then(() => {
                const params = new URLSearchParams(window.location.search);
                params.set('q', getState().query);
                history.pushState(getState(), null, '?' + params.toString());
            })
            .catch(errorHandler);
    };
}

/**
 * Start a follow topic action
 *
 * @param {String} topic
 */
export function followTopic(topic) {
    return renderModal('followTopic', {topic});
}

export function submitFollowTopic(data) {
    return (dispatch, getState) => {
        const user = getState().user;
        const url = `/api/users/${user}/topics`;
        return server.post(url, data)
            .then((updates) => dispatch(addTopic(Object.assign(data, updates))))
            .then(() => dispatch(closeModal()))
            .catch(errorHandler);
    };
}

/**
 * Start share item action - display modal to pick users
 *
 * @return {function}
 */
export function shareItem(item) {
    return (dispatch, getState) => {
        const user = getState().user;
        const company = getState().company;
        return server.get(`/companies/${company}/users`)
            .then((users) => users.filter((u) => u._id !== user))
            .then((users) => dispatch(renderModal('shareItem', {item, users})))
            .catch(errorHandler);
    };
}

/**
 * Submit share item form and close modal if that works
 *
 * @param {Object} data
 */
export function submitShareItem(data) {
    return (dispatch) => {
        return server.post(`/wire/${data.item}/share`, data)
            .then(() => {
                notify.success(gettext('Item was shared successfully'));
                dispatch(closeModal());
            })
            .catch(errorHandler);
    };
}

function errorHandler(reason) {
    console.error('error', reason);
}
