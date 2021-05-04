import {get, isEmpty} from 'lodash';
import mime from 'mime-types';

import server from 'server';
import analytics from 'analytics';

import {
    gettext,
    notify,
    updateRouteParams,
    getTimezoneOffset,
    getTextFromHtml,
    fullDate,
    recordAction,
    errorHandler as notifyErrors,
    getSlugline,
} from 'utils';
import {getNavigationUrlParam} from 'search/utils';

import {searchParamsSelector} from 'search/selectors';
import {context} from 'selectors';

import {markItemAsRead, toggleNewsOnlyParam} from 'local-store';
import {renderModal, closeModal, setSavedItemsCount} from 'actions';

import {
    initParams as initSearchParams,
    setNewItemsByTopic,
    loadTopics,
    setTopics,
    loadMyTopic,
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

export function previewAndCopy(item) {
    return (dispatch) => {
        dispatch(previewItem(item));
        dispatch(copyPreviewContents(item));
    };
}

export function previewItem(item) {
    return (dispatch, getState) => {
        markItemAsRead(item, getState());
        dispatch(preview(item));
        recordAction(item, 'preview', getState().context, getState());
    };
}

export const OPEN_ITEM = 'OPEN_ITEM';
export function openItemDetails(item) {
    return {type: OPEN_ITEM, item};
}

export function openItem(item) {
    return (dispatch, getState) => {
        const state = getState();
        markItemAsRead(item, state);
        dispatch(openItemDetails(item));
        updateRouteParams({
            item: item ? item._id : null
        },  {
            ...state,
            openItem: item,
        });
        recordAction(item, 'open', state.context);
    };
}

export function selectCopy(item) {
    return () => {
        recordAction(item, 'clipboard');
    };
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
export function initData(wireData, readData, newsOnly) {
    return {type: INIT_DATA, wireData, readData, newsOnly};
}

export const TOGGLE_NEWS = 'TOGGLE_NEWS';
export function toggleNews() {
    toggleNewsOnlyParam();
    return {type: TOGGLE_NEWS};
}

export function removeItems(items) {
    if (confirm(gettext('Are you sure you want to permanently remove these item(s)?'))) {
        return server.del('/wire', {items})
            .then(() => {
                if (items.length > 1) {
                    notify.success(gettext('Items were removed successfully'));
                } else {
                    notify.success(gettext('Item was removed successfully'));
                }
            })
            .catch(notifyErrors);
    }

    return Promise.resolve();
}

export const WIRE_ITEM_REMOVED = 'WIRE_ITEM_REMOVED';
/**
 * Marks the items as deleted when they're removed from the system
 * @param {Array<String>} ids - List of ids of items that were removed
 */
export function onItemsDeleted(ids) {
    return {type: WIRE_ITEM_REMOVED, ids: ids};
}

/**
 * Copy contents of item preview.
 *
 * This is an initial version, should be updated with preview markup changes.
 */
export function copyPreviewContents(item) {
    return (dispatch, getState) => {
        const textarea = document.getElementById('copy-area');
        const contents = [];

        contents.push(fullDate(item.versioncreated));
        item.slugline && contents.push(getSlugline(item, true));
        item.headline && contents.push(item.headline);
        item.byline && contents.push(gettext('By: {{ byline }}', {byline: item.byline}));
        item.located && contents.push(gettext('Location: {{ located }}', {located: item.located}));
        item.source && contents.push(gettext('Source: {{ source }}', {source: item.source}));

        contents.push('');

        if (item.description_text) {
            contents.push(item.description_text);
        } else if (item.description_html) {
            contents.push(getTextFromHtml(item.description_html));
        }

        contents.push('');

        if (item.body_text) {
            contents.push(item.body_text);
        } else if (item.body_html) {
            contents.push(getTextFromHtml(item.body_html));
        }

        textarea.value = contents.join('\n');
        textarea.select();

        if (document.execCommand('copy')) {
            notify.success(gettext('Item copied successfully.'));
            item && analytics.itemEvent('copy', item);
        } else {
            notify.error(gettext('Sorry, Copy is not supported.'));
        }

        if (getState().user) {
            server.post(`/wire/${item._id}/copy?type=${getState().context}`)
                .then(dispatch(setCopyItem(item._id)))
                .catch(errorHandler);
        }
    };
}

export function printItem(item) {
    return (dispatch, getState) => {
        const userContext = context(getState());
        let uri = `/${userContext}/${item._id}?print`;
        if (userContext === 'monitoring') {
            const monitoringProfile = get(getState(), 'search.activeNavigation[0]');
            uri = `${uri}=true&monitoring_profile=${monitoringProfile}&type=monitoring`;
        }
        window.open(uri, '_blank');
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
export function search(state, next) {
    const searchParams = searchParamsSelector(state);
    const createdFilter = get(searchParams, 'created') || {};
    let created_to = createdFilter.to;

    if (createdFilter.from && createdFilter.from.indexOf('now') >= 0) {
        created_to = createdFilter.from;
    }

    const newsOnly = !!get(state, 'wire.newsOnly');
    const context = get(state, 'context', 'wire');

    const params = {
        q: !searchParams.query ? null : encodeURIComponent(searchParams.query),
        bookmarks: state.bookmarks && state.user,
        navigation: getNavigationUrlParam(searchParams.navigation, true, false),
        filter: !isEmpty(searchParams.filter) && encodeURIComponent(JSON.stringify(searchParams.filter)),
        from: next ? state.items.length : 0,
        created_from: createdFilter.from,
        created_to,
        timezone_offset: getTimezoneOffset(),
        newsOnly,
        product: searchParams.product,
        es_highlight: !searchParams.query ? null : 1,
    };

    const queryString = Object.keys(params)
        .filter((key) => params[key])
        .map((key) => [key, params[key]].join('='))
        .join('&');

    return server.get(`/${context}/search?${queryString}&tick=${Date.now().toString()}`);
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
                analytics.timingComplete('search', Date.now() - start);
            })
            .catch(errorHandler);
    };
}


export function fetchItem(id) {
    return (dispatch, getState) => {
        return server.get(`/${context(getState())}/${id}?format=json&context=wire`)
            .then((data) => dispatch(recieveItem(data)))
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

export const SHARE_ITEMS = 'SHARE_ITEMS';
export function setShareItems(items) {
    return {type: SHARE_ITEMS, items};
}

export const DOWNLOAD_ITEMS = 'DOWNLOAD_ITEMS';
export function setDownloadItems(items) {
    return {type: DOWNLOAD_ITEMS, items};
}

export const EXPORT_ITEMS = 'EXPORT_ITEMS';
export function setExportItems(items) {
    return {type: EXPORT_ITEMS, items};
}

export const COPY_ITEMS = 'COPY_ITEMS';
export function setCopyItem(item) {
    return {type: COPY_ITEMS, items: [item]};
}

export const PRINT_ITEMS = 'PRINT_ITEMS';
export function setPrintItem(item) {
    return {type: PRINT_ITEMS, items: [item]};
}

export const BOOKMARK_ITEMS = 'BOOKMARK_ITEMS';
export function setBookmarkItems(items) {
    return {type: BOOKMARK_ITEMS, items};
}

export const REMOVE_BOOKMARK = 'REMOVE_BOOKMARK';
export function removeBookmarkItems(items) {
    return {type: REMOVE_BOOKMARK, items};
}

export function bookmarkItems(items) {
    return (dispatch, getState) =>
        server.post(`/${getState().context}_bookmark`, {items})
            .then(() => {
                if (items.length > 1) {
                    notify.success(gettext('Items were bookmarked successfully.'));
                } else {
                    notify.success(gettext('Item was bookmarked successfully.'));
                }
            })
            .then(() => {
                analytics.multiItemEvent('bookmark', items.map((_id) => getState().itemsById[_id]));
            })
            .then(() => dispatch(setBookmarkItems(items)))
            .catch(errorHandler);
}

export function removeBookmarks(items) {
    return (dispatch, getState) =>
        server.del(`/${getState().context}_bookmark`, {items})
            .then(() => {
                if (items.length > 1) {
                    notify.success(gettext('Items were removed from bookmarks successfully.'));
                } else {
                    notify.success(gettext('Item was removed from bookmarks successfully.'));
                }
            })
            .then(() => dispatch(removeBookmarkItems(items)))
            .then(() => getState().bookmarks &&  dispatch(fetchItems()))
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
 * Download video file
 *
 * @param {string} id
 */
export function downloadVideo(href, id, mimeType) {
    window.open(`${href}?filename=${id}.${mime.extension(mimeType)}`, '_blank');
    analytics.event('download-video', id);
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
 * @param {String} params
 */
export function submitDownloadItems(items, params) {
    return (dispatch, getState) => {
        const {format, secondaryFormat} = params;
        const userContext = context(getState());
        let uri = `/download/${items.join(',')}?format=${format}&type=${userContext}`;
        if (userContext === 'monitoring') {
            const monitoringProfile = get(getState(), 'search.activeNavigation[0]');
            uri = `/monitoring/export/${items.join(',')}?format=${format}&monitoring_profile=${monitoringProfile}`;
            uri = `${uri}&secondary_format=${secondaryFormat}`;
        }
        window.open(uri, '_blank');
        dispatch(setDownloadItems(items));
        dispatch(closeModal());
        analytics.multiItemEvent('download', items.map((_id) => getState().itemsById[_id]));
    };
}


export const REMOVE_NEW_ITEMS = 'REMOVE_NEW_ITEMS';
export function removeNewItems(data) {
    return {type: REMOVE_NEW_ITEMS, data};
}

/**
 * Handle server push notification
 *
 * @param {Object} push
 */
export function pushNotification(push) {
    return (dispatch, getState) => {
        const user = getState().user;
        switch (push.event) {
        case 'topic_matches':
            return dispatch(setNewItemsByTopic(push.extra));

        case 'new_item':
            return dispatch(setNewItems(push.extra));

        case `topics:${user}`:
            return dispatch(reloadTopics(user));

        case `topic_created:${user}`:
            return dispatch(reloadTopics(user, true));

        case `saved_items:${user}`:
            return dispatch(setSavedItemsCount(push.extra.count));

        case 'items_deleted':
            return dispatch(onItemsDeleted(push.extra.ids));
        }
    };
}

function reloadTopics(user, reloadTopic = false) {
    return function (dispatch) {
        return loadTopics(user)
            .then((data) => {
                const wireTopics = data._items.filter((topic) => !topic.topic_type || topic.topic_type === 'wire');
                dispatch(setTopics(wireTopics));

                if (reloadTopic) {
                    const params = new URLSearchParams(window.location.search);
                    if (params.get('topic')) {
                        dispatch(loadMyWireTopic(params.get('topic')));
                    }
                }
            })
            .catch(errorHandler);
    };
}

export const SET_NEW_ITEMS = 'SET_NEW_ITEMS';
export function setNewItems(data) {
    return function (dispatch) {
        if (get(data, '_items.length') <= 0 || get(data, '_items[0].type') !== 'text') {
            return Promise.resolve();
        }

        dispatch({type: SET_NEW_ITEMS, data});
        return Promise.resolve();
    };
}

export function fetchNewItems() {
    return (dispatch, getState) => search(getState())
        .then((response) => dispatch(setNewItems(response)));
}

export function fetchNext(item) {
    return () => {
        if (!item.nextversion) {
            return Promise.reject();
        }

        return server.get(`/wire/${item.nextversion}?format=json`);
    };
}

export const TOGGLE_FILTER = 'TOGGLE_FILTER';
export function toggleFilter(key, val, single) {
    return (dispatch) => {
        setTimeout(() => dispatch({type: TOGGLE_FILTER, key, val, single}));
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

export function loadMyWireTopic(topicId) {
    return (dispatch) => {
        dispatch(loadMyTopic(topicId));
        return dispatch(fetchItems());
    };
}

/**
 * Set state on app init using url params
 *
 * @param {URLSearchParams} params
 */
export function initParams(params) {
    return (dispatch, getState) => {
        dispatch(initSearchParams(params));
        if (params.get('item')) {
            dispatch(fetchItem(params.get('item')))
                .then(() => {
                    const item = getState().itemsById[params.get('item')];
                    dispatch(openItem(item));
                });
        }
    };
}
