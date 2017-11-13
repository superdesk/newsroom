
import { get, isEmpty, pickBy } from 'lodash';

import server from 'server';
import { gettext, notify, updateRouteParams, now } from 'utils';

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

export const OPEN_ITEM = 'OPEN_ITEM';
export function openItemDetails(item) {
    return {type: OPEN_ITEM, item};
}

export function openItem(item) {
    return (dispatch, getState) => {
        dispatch(openItemDetails(item));
        updateRouteParams({
            item: item ? item._id : null
        }, getState());
    };
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

export const RECIEVE_ITEM = 'RECIEVE_ITEM';
export function recieveItem(data) {
    return {type: RECIEVE_ITEM, data};
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
 * Search server request
 *
 * @param {Object} state
 * @param {bool} next
 * @return {Promise}
 */
function search(state, next) {
    const activeFilter = get(state, 'wire.activeFilter', {});
    const activeService = pickBy(get(state, 'wire.activeService', {}));
    const createdFilter = get(state, 'wire.createdFilter', {});

    const params = {
        q: state.query,
        bookmarks: state.bookmarks && state.user,
        service: !isEmpty(activeService) && JSON.stringify(activeService),
        filter: !isEmpty(activeFilter) && JSON.stringify(activeFilter),
        from: next ? state.items.length : 0,
        created_from: createdFilter.from,
        created_to: createdFilter.to,
        timezone_offset: now.getTimezoneOffset(),
    };

    const queryString = Object.keys(params)
        .filter((key) => params[key])
        .map((key) => [key, params[key]].join('='))
        .join('&');

    return server.get(`/search?${queryString}`);
}

/**
 * Fetch items for current query
 */
export function fetchItems() {
    return (dispatch, getState) => {
        dispatch(queryItems());
        return search(getState())
            .then((data) => dispatch(recieveItems(data)))
            .then(() => {
                const state = getState();
                updateRouteParams({
                    q: state.query,
                }, state);
            })
            .catch(errorHandler);
    };
}


export function fetchItem(id) {
    return (dispatch) => {
        return server.get(`/wire/${id}?format=json`)
            .then((data) => dispatch(recieveItem(data)))
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
export function shareItems(items) {
    return (dispatch, getState) => {
        const user = getState().user;
        const company = getState().company;
        return server.get(`/companies/${company}/users`)
            .then((users) => users.filter((u) => u._id !== user))
            .then((users) => dispatch(renderModal('shareItem', {items, users})))
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
        return server.post('/wire_share', data)
            .then(() => {
                if (data.items.length > 1) {
                    notify.success(gettext('Items were shared successfully.'));
                } else {
                    notify.success(gettext('Item was shared successfully.'));
                }
                dispatch(closeModal());
            })
            .catch(errorHandler);
    };
}

export const TOGGLE_SELECTED = 'TOGGLE_SELECTED';
export function toggleSelected(item) {
    return {type: TOGGLE_SELECTED, item};
}

export const SELECT_ALL = 'SELECT_ALL';
export function selectAll() {
    return {type: SELECT_ALL};
}

export const SELECT_NONE = 'SELECT_NONE';
export function selectNone() {
    return {type: SELECT_NONE};
}

export function bookmarkItems(items) {
    return () =>
        server.post('/wire_bookmark', {items})
            .then(() => {
                if (items.length > 1) {
                    notify.success(gettext('Items were bookmarked successfully.'));
                } else {
                    notify.success(gettext('Item was bookmarked successfully.'));
                }
            })
            .catch(errorHandler);
}

export function removeBookmarks(items) {
    return (dispatch) =>
        server.del('/wire_bookmark', {items})
            .then(() => {
                if (items.length > 1) {
                    notify.success(gettext('Items were removed from bookmarks successfully.'));
                } else {
                    notify.success(gettext('Item was removed from bookmarks successfully.'));
                }
            })
            .then(() => dispatch(fetchItems()))
            .catch(errorHandler);
}

function errorHandler(reason) {
    console.error('error', reason);
}

/**
 * Fetch item versions.
 *
 * @param {Object} item
 * @return {Promise}
 */
export function fetchVersions(item) {
    return () => server.get(`/wire/${item._id}/versions`)
        .then((data) => {
            return data._items;
        });
}

/**
 * Download items - display modal to pick a format
 *
 * @param {Array} items
 */
export function downloadItems(items) {
    return renderModal('downloadItems', {items});
}

/**
 * Start download - open download view in new window.
 *
 * @param {Array} items
 * @param {String} format
 */
export function submitDownloadItems(items, format) {
    return (dispatch) => {
        window.open(`/download/${items.join(',')}?format=${format}`, '_blank');
        dispatch(closeModal());
    };
}

export const SET_NEW_ITEMS = 'SET_NEW_ITEMS';
export function setNewItems(data) {
    return {type: SET_NEW_ITEMS, data};
}


export const REMOVE_NEW_ITEMS = 'REMOVE_NEW_ITEMS';
export function removeNewItems(data) {
    return {type: REMOVE_NEW_ITEMS, data};
}

/**
 * Handle server push notification
 *
 * @param {Object} data
 */
export function pushNotification(push) {
    return (dispatch) => {
        switch (push.event) {
        case 'update':
            return dispatch(setNewItems(push.extra));
        }
    };
}

export function fetchNext(item) {
    return () => {
        if (!item.nextversion) {
            return Promise.reject();
        }

        return server.get(`/wire/${item.nextversion}?format=json`);
    };
}

export const TOGGLE_SERVICE = 'TOGGLE_SERVICE';
function _toggleService(service) {
    return {type: TOGGLE_SERVICE, service};
}

export function toggleService(service) {
    return (dispatch) => {
        dispatch(setQuery(''));
        dispatch(_toggleService(service));
        return dispatch(fetchItems());
    };
}

export const TOGGLE_FILTER = 'TOGGLE_FILTER';
export function toggleFilter(key, val, single) {
    return (dispatch) => {
        dispatch({type: TOGGLE_FILTER, key, val, single});
        dispatch(fetchItems());
    };
}

export const START_LOADING = 'START_LOADING';
export function startLoading() {
    return {type: START_LOADING};
}

export const RECIEVE_NEXT_ITEMS = 'RECIEVE_NEXT_ITEMS';
export function recieveNextItems(data) {
    return {type: RECIEVE_NEXT_ITEMS, data};
}

const MAX_ITEMS = 1000; // server limit
export function fetchMoreItems() {
    return (dispatch, getState) => {
        const state = getState();
        const limit = Math.min(MAX_ITEMS, state.totalItems);

        if (state.isLoading || state.items.length >= limit) {
            return Promise.reject();
        }

        dispatch(startLoading());
        return search(getState(), true)
            .then((data) => dispatch(recieveNextItems(data)))
            .catch(errorHandler);
    };
}

/**
 * Set state on app init using url params
 *
 * @param {URLSearchParams} params
 */
export function initParams(params) {
    return (dispatch, getState) => {
        if (params.get('q')) {
            dispatch(setQuery(params.get('q')));
        }
        if (params.get('item')) {
            dispatch(fetchItem(params.get('item')))
                .then(() => {
                    const item = getState().itemsById[params.get('item')];
                    dispatch(openItem(item));
                });
        }
    };
}

function _setCreatedFilter(filter) {
    return {type: SET_CREATED_FILTER, filter};
}

export const SET_CREATED_FILTER = 'SET_CREATED_FILTER';
export function setCreatedFilter(filter) {
    return (dispatch) => {
        dispatch(_setCreatedFilter(filter));
        dispatch(fetchItems());
    };
}

function _resetFilter(filter) {
    return {type: RESET_FILTER, filter};
}

export const RESET_FILTER = 'RESET_FILTER';
export function resetFilter(filter) {
    return (dispatch) => {
        dispatch(_resetFilter(filter));
        dispatch(fetchItems());
    };
}

/**
 * Set query for given topic
 *
 * @param {Object} topic
 * @return {Promise}
 */
export function setTopicQuery(topic) {
    return (dispatch) => {
        dispatch(_toggleService());
        dispatch(setQuery(topic.query || ''));
        dispatch(_resetFilter(topic.filter));
        dispatch(_setCreatedFilter(topic.created));
        return dispatch(fetchItems());
    };
}

export const SET_VIEW = 'SET_VIEW';
export function setView(view) {
    localStorage.setItem('view', view);
    return {type: SET_VIEW, view};
}
