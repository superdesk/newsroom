
import { get, isEmpty } from 'lodash';
import server from 'server';
import analytics from 'analytics';
import { gettext, notify, updateRouteParams, getTimezoneOffset } from 'utils';
import { markItemAsRead } from 'wire/utils';
import { renderModal, closeModal } from 'actions';
import {getDateInputDate} from './utils';

import {
    setQuery,
    toggleTopic,
    resetFilter,
    toggleFilter,
    toggleNavigation,
    setCreatedFilter,
} from 'search/actions';

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
export function preview(item) {
    return {type: PREVIEW_ITEM, item};
}


export function previewItem(item) {
    return (dispatch, getState) => {
        markItemAsRead(item, getState());
        dispatch(preview(item));
        item && analytics.itemEvent('preview', item);
    };
}

export const BOOKMARK_ITEMS = 'BOOKMARK_ITEMS';
export const REMOVE_BOOKMARK = 'REMOVE_BOOKMARK';

export const OPEN_ITEM = 'OPEN_ITEM';
export function openItemDetails(item) {
    return {type: OPEN_ITEM, item};
}

export function requestCoverage(item, message) {
    return () => {
        const url = '/agenda/request_coverage';
        const data = { item: item._id, message };
        return server.post(url, data);
    };
}

export function openItem(item) {
    return (dispatch, getState) => {
        markItemAsRead(item, getState());
        dispatch(openItemDetails(item));
        updateRouteParams({
            item: item ? item._id : null
        }, getState());
        item && analytics.itemEvent('open', item);
        analytics.itemView(item);
    };
}

export const SET_EVENT_QUERY = 'SET_EVENT_QUERY';
export function setQueryById(query) {
    query && analytics.event('search', query);
    return {type: SET_EVENT_QUERY, query};
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

export const INIT_DATA = 'INIT_DATA';
export function initData(agendaData, readData) {
    return {type: INIT_DATA, agendaData, readData};
}

export const ADD_TOPIC = 'ADD_TOPIC';
export function addTopic(topic) {
    return {type: ADD_TOPIC, topic};
}

export const SELECT_DATE = 'SELECT_DATE';
export function selectDate(dateString, grouping) {
    return {type: SELECT_DATE, dateString, grouping};
}


export function printItem(item) {
    return (dispatch, getState) => {
        window.open(`/agenda/${item._id}?print`, '_blank');
        item && analytics.itemEvent('print', item);
        if (getState().user) {
            dispatch(setPrintItem(item._id));
        }
    };
}

/**
 * Search server request
 *
 * @param {Object} state
 * @param {bool} next
 * @return {Promise}
 */
function search(state, next) {
    const activeFilter = get(state, 'search.activeFilter', {});
    const activeNavigation = get(state, 'search.activeNavigation');
    const createdFilter = get(state, 'search.createdFilter', {});
    const agendaDate = getDateInputDate(get(state, 'agenda.activeDate'));

    const params = {
        q: state.query,
        id: state.queryId,
        bookmarks: state.bookmarks && state.user,
        navigation: activeNavigation,
        filter: !isEmpty(activeFilter) && JSON.stringify(activeFilter),
        from: next ? state.items.length : 0,
        created_from: createdFilter.from,
        created_to: createdFilter.to,
        date_from: agendaDate,
        timezone_offset: getTimezoneOffset(),
    };

    const queryString = Object.keys(params)
        .filter((key) => params[key])
        .map((key) => [key, params[key]].join('='))
        .join('&');

    return server.get(`/agenda/search?${queryString}&tick=${Date.now().toString()}`);
}

/**
 * Fetch items for current query
 */
export function fetchItems() {
    return (dispatch, getState) => {
        const start = Date.now();
        dispatch(queryItems());
        return search(getState())
            .then((data) => dispatch(recieveItems(data)))
            .then(() => {
                const state = getState();
                updateRouteParams({
                    q: state.query,
                }, state);
                analytics.timingComplete('search', Date.now() - start);
            })
            .catch(errorHandler);
    };
}


export function fetchItem(id) {
    return (dispatch) => {
        return server.get(`/agenda/${id}?format=json`)
            .then((data) => dispatch(recieveItem(data)))
            .catch(errorHandler);
    };
}

/**
 * Start a follow topic action
 *
 * @param {String} topic
 */
export function followEvent(topic) {
    topic.topic_type = 'agenda';
    return renderModal('followTopic', {topic});
}

export function submitFollowTopic(data) {
    return (dispatch, getState) => {
        const user = getState().user;
        const url = `/api/users/${user}/topics`;
        data.timezone_offset = getTimezoneOffset();
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
    return (dispatch, getState) => {
        return server.post('/agenda_share', data)
            .then(() => {
                if (data.items.length > 1) {
                    notify.success(gettext('Items were shared successfully.'));
                } else {
                    notify.success(gettext('Item was shared successfully.'));
                }
                dispatch(closeModal());
            })
            .then(() => multiItemEvent('share', data.items, getState()))
            .then(() => dispatch(setShareItems(data.items)))
            .catch(errorHandler);
    };
}

export const TOGGLE_SELECTED = 'TOGGLE_SELECTED';
export function toggleSelected(item) {
    return {type: TOGGLE_SELECTED, item};
}

export const SHARE_ITEMS = 'SHARE_ITEMS';
export function setShareItems(items) {
    return {type: SHARE_ITEMS, items};
}

export const DOWNLOAD_ITEMS = 'DOWNLOAD_ITEMS';
export function setDownloadItems(items) {
    return {type: DOWNLOAD_ITEMS, items};
}

export const COPY_ITEMS = 'COPY_ITEMS';
export function setCopyItem(item) {
    return {type: COPY_ITEMS, items: [item]};
}

export const PRINT_ITEMS = 'PRINT_ITEMS';
export function setPrintItem(item) {
    return {type: PRINT_ITEMS, items: [item]};
}


function errorHandler(reason) {
    console.error('error', reason);
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
    return (dispatch, getState) => {
        window.open(`/download/${items.join(',')}?format=${format}&type=${getState().context}`, '_blank');
        dispatch(setDownloadItems(items));
        dispatch(closeModal());
        multiItemEvent('download', items, getState());
    };
}

export const SET_NEW_ITEMS_BY_TOPIC = 'SET_NEW_ITEMS_BY_TOPIC';
export function setNewItemsByTopic(data) {
    return {type: SET_NEW_ITEMS_BY_TOPIC, data};
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
    return (dispatch, getState) => {
        const user = getState().user;
        switch (push.event) {
        case 'topic_matches':
            return dispatch(setNewItemsByTopic(push.extra));

        case 'new_item':
            return new Promise((resolve, reject) => {
                dispatch(fetchNewItems()).then(resolve).catch(reject);
            });

        case `topics:${user}`:
            return dispatch(reloadTopics(user));
        }
    };
}

function reloadTopics(user) {
    return function (dispatch) {
        return server.get(`/users/${user}/topics`)
            .then((data) => {
                const agendaTopics = data._items.filter((topic) => topic.topic_type === 'agenda');
                return dispatch(setTopics(agendaTopics));
            })
            .catch(errorHandler);
    };
}

export const SET_TOPICS = 'SET_TOPICS';
function setTopics(topics) {
    return {type: SET_TOPICS, topics};
}

export const SET_NEW_ITEMS = 'SET_NEW_ITEMS';
export function setNewItems(data) {
    return {type: SET_NEW_ITEMS, data};
}

export function fetchNewItems() {
    return (dispatch, getState) => search(getState())
        .then((response) => dispatch(setNewItems(response)));
}

export function toggleDropdownFilter(key, val) {
    return (dispatch) => {
        dispatch(toggleFilter(key, val, true));
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

/**
 * Set query for given topic
 *
 * @param {Object} topic
 * @return {Promise}
 */
export function setEventQuery(topic) {
    return (dispatch) => {
        dispatch(toggleNavigation());
        dispatch(toggleTopic(topic));
        dispatch(setQueryById(topic.query || ''));
        dispatch(resetFilter(topic.filter));
        dispatch(setCreatedFilter(topic.created));
        return dispatch(fetchItems());
    };
}

export function refresh() {
    return (dispatch, getState) => dispatch(recieveItems(getState().newItemsData));
}

function multiItemEvent(event, items, state) {
    items.forEach((itemId) => {
        const item = state.itemsById[itemId];
        item && analytics.itemEvent(event, item);
    });
}