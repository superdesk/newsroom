import { get, isEmpty, includes } from 'lodash';
import moment from 'moment';

import server from 'server';
import analytics from 'analytics';
import {
    gettext,
    notify,
    updateRouteParams,
    getTimezoneOffset,
    errorHandler,
    getLocaleDate,
    DATE_FORMAT,
    TIME_FORMAT,
    recordAction
} from 'utils';
import {noNavigationSelected, getNavigationUrlParam} from 'search/utils';

import { markItemAsRead, toggleFeaturedOnlyParam } from 'local-store';
import { renderModal, setSavedItemsCount } from 'actions';
import {
    getCalendars,
    getDateInputDate,
    getLocationString,
    getPublicContacts,
    hasLocation,
    getMomentDate,
} from './utils';

import {
    toggleFilter,
    initParams as initSearchParams,
    setNewItemsByTopic,
    loadTopics,
    setTopics,
    loadMyTopic,
} from 'search/actions';
import {searchParamsSelector} from 'search/selectors';

import {clearAgendaDropdownFilters} from '../local-store';
import {getLocations, getMapSource} from '../maps/utils';

const WATCH_URL = '/agenda_watch';
const WATCH_COVERAGE_URL = '/agenda_coverage_watch';

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
export function preview(item, group, plan) {
    return {type: PREVIEW_ITEM, item, group, plan};
}

export function previewAndCopy(item) {
    return (dispatch) => {
        dispatch(copyPreviewContents(item));
    };
}

export function previewItem(item, group, plan) {
    return (dispatch, getState) => {
        dispatch(fetchWireItemsForAgenda(item));
        markItemAsRead(item, getState());
        dispatch(preview(item, group, plan));
        recordAction(item, 'preview', getState().context, getState());
    };
}

export function fetchWireItemsForAgenda(item) {
    return (dispatch) => {
        let wireIds = [];
        (get(item, 'coverages') || []).forEach((c) => {
            if (c.coverage_type === 'text' && c.delivery_id) {
                wireIds.push(c.delivery_id);
            }
        });

        if (wireIds.length > 0){
            return server.get(`/wire/items/${wireIds.join(',')}`)
                .then((items) => {
                    dispatch(agendaWireItems(items));
                    return Promise.resolve(items);
                })
                .catch((error) => errorHandler(error, dispatch));
        }
    };
}

export const AGENDA_WIRE_ITEMS = 'AGENDA_WIRE_ITEMS';
export function agendaWireItems(items) {
    return {type: AGENDA_WIRE_ITEMS, items};
}

export const OPEN_ITEM = 'OPEN_ITEM';
export function openItemDetails(item, group, plan) {
    return {type: OPEN_ITEM, item, group, plan};
}

export function requestCoverage(item, message) {
    return () => {
        const url = '/agenda/request_coverage';
        const data = { item: item._id, message };
        return server.post(url, data)
            .then(() => notify.success(gettext('Your inquiry has been sent successfully')))
            .catch(errorHandler);
    };
}

export function openItem(item, group, plan) {
    return (dispatch, getState) => {
        const state = getState();
        markItemAsRead(item, state);
        dispatch(fetchWireItemsForAgenda(item));
        dispatch(openItemDetails(item, group, plan));
        updateRouteParams({
            item: item ? item._id : null,
            group: group || null,
            plan: plan || null,
        }, {
            ...state,
            openItem: item,
        });
        recordAction(item, 'open', state.context);
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
export function initData(agendaData, readData, activeDate, featuredOnly) {
    return {type: INIT_DATA, agendaData, readData, activeDate, featuredOnly};
}

export const SELECT_DATE = 'SELECT_DATE';
export function selectDate(dateString, grouping) {
    return {type: SELECT_DATE, dateString, grouping};
}


export function printItem(item) {
    return (dispatch, getState) => {
        const map = encodeURIComponent(getMapSource(getLocations(item), 2));
        window.open(`/agenda/${item._id}?print&map=${map}`, '_blank');

        item && analytics.itemEvent('print', item);
        if (getState().user) {
            dispatch(setPrintItem(item._id));
        }
    };
}


/**
 * Copy contents of agenda preview.
 *
 * This is an initial version, should be updated with preview markup changes.
 */
export function copyPreviewContents(item) {
    return (dispatch, getState) => {
        const textarea = document.getElementById('copy-area');
        const contents = [];

        item.name && contents.push(item.name);
        item.name && contents.push(gettext('Dates: {{ dates }}', {dates: `${getLocaleDate(item.dates.start)} - ${getLocaleDate(item.dates.end)}`}));
        hasLocation(item) && contents.push(gettext('Location: {{ location }}', {location: getLocationString(item)}));
        item.ednote && contents.push(gettext('Ednote: {{ ednote }}', {ednote: item.ednote}));

        if (item.definition_short) {
            contents.push(gettext('Description: {{ description }}', {description: item.definition_short}));
        }

        const contacts = getPublicContacts(item);
        if (!isEmpty(contacts)) {
            contents.push(gettext(''));
            contents.push(gettext('Contacts'));
            contacts.map(contact => {
                contents.push(gettext('Name: {{ contact }}', {contact: contact.name}));
                contact.organisation && contents.push(gettext('Organisation: {{ organisation }}', {organisation: contact.organisation}));
                contact.contact_email && contents.push(gettext('Email: {{ email }}', {email: contact.contact_email}));
                contact.phone && contents.push(gettext('Phone: {{ phone }}', {phone: contact.phone}));
                contact.mobile && contents.push(gettext('Mobile: {{ mobile }}', {mobile: contact.mobile}));
                contents.push('');
            });
        }

        const calendars = getCalendars(item);
        calendars && contents.push(gettext('Calendars: {{ calendars }}', {calendars}));

        contents.push('');

        if (!isEmpty(item.planning_items)) {
            item.planning_items.map(pi => {
                contents.push(gettext('Planning item'));
                contents.push(gettext('Description: {{ description }}', {description: pi.description_text}));
                pi.coverages &&  pi.coverages.map(coverage => {
                    contents.push(gettext('Coverage type: {{ type }}', {type: coverage.planning.g2_content_type}));
                    contents.push(gettext('Scheduled: {{ schedule }}', {schedule: getLocaleDate(coverage.planning.scheduled)}));
                    contents.push(gettext('Status: {{ status }}', {status: coverage.workflow_status}));
                    coverage.planning.description_text && contents.push(gettext('Description: {{ description }}', {description: coverage.planning.description_text}));
                    contents.push('');
                });
            });
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

/**
 * Search server request
 *
 * @param {Object} state
 * @param {bool} next
 * @return {Promise}
 */
function search(state, next) {
    const currentMoment = moment();
    const searchParams = searchParamsSelector(state);
    const createdFilter = get(searchParams, 'created') || {};

    const eventsOnlyFilter = !state.bookmarks &&
        get(state, 'agenda.eventsOnlyView', false);

    const featuredFilter = noNavigationSelected(searchParams.navigation) &&
        !state.bookmarks &&
        !eventsOnlyFilter &&
        get(state, 'agenda.featuredOnly');

    let fromDateFilter;

    if (featuredFilter) {
        fromDateFilter = getMomentDate(get(state, 'agenda.activeDate')).set({
            hour: currentMoment.hour(),
            minute: currentMoment.minute()
        }).format(`${DATE_FORMAT} ${TIME_FORMAT}`);
    } else {
        const agendaDate = getDateInputDate(get(state, 'agenda.activeDate'));
        fromDateFilter = (
            isEmpty(createdFilter.from) &&
            isEmpty(createdFilter.to) &&
            !(state.bookmarks && state.user)
        ) ? agendaDate : createdFilter.from;
    }

    let dateTo = createdFilter.to;
    if (createdFilter.from && createdFilter.from.indexOf('now') >= 0) {
        dateTo = createdFilter.from;
    }

    const params = {
        q: searchParams.query,
        id: state.queryId,
        bookmarks: state.bookmarks && state.user,
        navigation: getNavigationUrlParam(searchParams.navigation, true, false),
        filter: !isEmpty(searchParams.filter) && encodeURIComponent(JSON.stringify(searchParams.filter)),
        from: next ? state.items.length : 0,
        date_from: fromDateFilter,
        date_to: dateTo,
        timezone_offset: getTimezoneOffset(),
        featured: featuredFilter,
        eventsOnlyView: eventsOnlyFilter,
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

export const WATCH_EVENTS = 'WATCH_EVENTS';
export function watchEvents(ids) {
    return (dispatch, getState) => {
        server.post(WATCH_URL, {items: ids})
            .then(() => {
                dispatch({type: WATCH_EVENTS, items: ids});
                notify.success(gettext('Started watching items successfully.'));
                analytics.multiItemEvent('watch', ids.map((_id) => getState().itemsById[_id]));
            });
    };
}

export const STOP_WATCHING_EVENTS = 'STOP_WATCHING_EVENTS';
export function stopWatchingEvents(items) {
    return (dispatch, getState) => {
        server.del(getState().bookmarks ? `${WATCH_URL}?bookmarks=true` : WATCH_URL, {items})
            .then(() => {
                notify.success(gettext('Stopped watching items successfully.'));
                if (getState().bookmarks) {
                    if (includes(items, getState().previewItem)) { // close preview if it's opened
                        dispatch(previewItem());
                    }

                    dispatch(fetchItems()); // item should get removed from the list in bookmarks view
                } else { // in agenda toggle item watched state
                    dispatch({type: STOP_WATCHING_EVENTS, items: items});
                }
            });
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
        server.post('/agenda_bookmark', {items})
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
        server.del('/agenda_bookmark', {items})
            .then(() => {
                if (items.length > 1) {
                    notify.success(gettext('Items were removed from bookmarks successfully.'));
                } else {
                    notify.success(gettext('Item was removed from bookmarks successfully.'));
                }
            })
            .then(() => dispatch(removeBookmarkItems(items)))
            .then(() => getState().bookmarks && dispatch(fetchItems()))
            .catch(errorHandler);
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


/**
 * Download items - display modal to pick a format
 *
 * @param {Array} items
 */
export function downloadItems(items) {
    return renderModal('downloadItems', {items});
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
            return dispatch(setAndUpdateNewItems(push.extra));

        case `topics:${user}`:
            return dispatch(reloadTopics(user));

        case `topic_created:${user}`:
            return dispatch(reloadTopics(user, true));

        case `saved_items:${user}`:
            return dispatch(setSavedItemsCount(push.extra.count));
        }
    };
}

function reloadTopics(user, reloadTopic = false) {
    return function (dispatch) {
        return loadTopics(user)
            .then((data) => {
                const agendaTopics = data._items.filter((topic) => topic.topic_type === 'agenda');
                dispatch(setTopics(agendaTopics));

                if (reloadTopic) {
                    const params = new URLSearchParams(window.location.search);
                    if (params.get('topic')) {
                        dispatch(loadMyAgendaTopic(params.get('topic')));
                    }
                }
            })
            .catch(errorHandler);
    };
}

export const SET_NEW_ITEMS = 'SET_NEW_ITEMS';
export function setAndUpdateNewItems(data) {
    return function(dispatch, getState) {
        if (get(data, '_items.length') <= 0 || get(data, '_items[0].type') !== 'agenda') {
            const state = getState();

            // Check if the item is used in the preview or opened agenda item
            // If yes, make it available to the preview
            if (get(data, '_items[0].type') !== 'text' || (!state.previewItem && !state.openItem)) {
                return Promise.resolve();
            }

            const agendaItem = state.openItem ? state.openItem : state.itemsById[state.previewItem];
            if (!agendaItem || get(agendaItem, 'coverages.length', 0) === 0) {
                return Promise.resolve();
            }

            const coveragesToCheck = agendaItem.coverages.map((c) => c.coverage_id);
            for(let i of data._items) {
                if (coveragesToCheck.includes(i.coverage_id)) {
                    dispatch(fetchWireItemsForAgenda(agendaItem));
                    break;
                }
            }

            return Promise.resolve();
        }

        dispatch(updateItems(data));

        // Do not use 'killed' items for new-item notifications
        let newItemsData = { ...data };
        if (get(newItemsData, '_items.length', 0) > 0) {
            newItemsData._items = newItemsData._items.filter((item) => item.state !== 'killed');
        }

        dispatch({type: SET_NEW_ITEMS, data: newItemsData});
        return Promise.resolve();
    };
}

export const UPDATE_ITEMS = 'UPDATE_ITEMS';
export function updateItems(data) {
    return {type: UPDATE_ITEMS, data};
}

export function toggleDropdownFilter(key, val) {
    return (dispatch) => {
        dispatch(setActive(null));
        dispatch(preview(null));
        key === 'eventsOnly' ? dispatch(toggleEventsOnlyFilter(val)) : dispatch(toggleFilter(key, val, true));
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
    if (params.get('filter') || params.get('created')) {
        clearAgendaDropdownFilters();
    }

    return (dispatch, getState) => {
        const featuredParam = params.get('featured');
        if (featuredParam && featuredParam !== get(getState(), 'agenda.featuredOnly', false).toString()) {
            dispatch(toggleFeaturedFilter(false));
        }

        dispatch(toggleEventsOnlyFilter(params.get('eventsOnlyView') ? true : false));
        dispatch(initSearchParams(params));
        if (params.get('item')) {
            dispatch(fetchItem(params.get('item')))
                .then(() => {
                    const item = getState().itemsById[params.get('item')];

                    dispatch(openItem(item, params.get('group'), params.get('plan')));
                });
        }
    };
}

/**
 * Set query for given topic
 *
 * @param {String} topicId
 * @return {Promise}
 */
export function loadMyAgendaTopic(topicId) {
    return (dispatch, getState) => {
        // Set featured query option to false when using navigations
        if (get(getState(), 'agenda.featuredOnly')) {
            dispatch({type: TOGGLE_FEATURED_FILTER});
        }

        dispatch(loadMyTopic(topicId));
        return dispatch(fetchItems());
    };
}

export const TOGGLE_FEATURED_FILTER = 'TOGGLE_FEATURED_FILTER';
export function toggleFeaturedFilter(fetch = true) {
    return (dispatch) => {
        toggleFeaturedOnlyParam();
        dispatch({type: TOGGLE_FEATURED_FILTER});
        if (!fetch) {
            return Promise.resolve;
        }

        return dispatch(fetchItems());
    };
}

export const TOGGLE_EVENTS_ONLY_FILTER = 'TOGGLE_EVENTS_ONLY_FILTER';
export function toggleEventsOnlyFilter(value) {
    return {type: TOGGLE_EVENTS_ONLY_FILTER, value};
}

export const WATCH_COVERAGE = 'WATCH_COVERAGE';
export function watchCoverage(coverage, item) {
    return (dispatch) => {
        server.post(WATCH_COVERAGE_URL, {
            coverage_id: coverage.coverage_id,
            item_id: item._id
        })
            .then(() => {
                dispatch({
                    type: WATCH_COVERAGE,
                    coverage,
                    item
                });
                notify.success(gettext('Started watching coverage successfully.'));
            }, (error) => { errorHandler(error, dispatch);});
    };
}

export const STOP_WATCHING_COVERAGE = 'STOP_WATCHING_COVERAGE';
export function stopWatchingCoverage(coverage, item) {
    return (dispatch, getState) => {
        server.del(WATCH_COVERAGE_URL, {
            coverage_id: coverage.coverage_id,
            item_id: item._id
        })
            .then(() => {
                notify.success(gettext('Stopped watching coverage successfully.'));
                dispatch({
                    type: STOP_WATCHING_COVERAGE,
                    coverage,
                    item
                });

                if (getState().bookmarks) {
                    dispatch(fetchItems()); // item should get removed from the list in bookmarks view
                }
            }, (error) => { errorHandler(error, dispatch);});
    };
}
