import {get, cloneDeep, assign, pickBy} from 'lodash';

import server from 'server';
import analytics from 'analytics';

import {getTimezoneOffset, errorHandler, notify, gettext, updateRouteParams, toggleValue} from 'utils';
import {getNavigationUrlParam, getSearchParams} from './utils';
import {getLocations, getMapSource} from 'maps/utils';

import {closeModal} from 'actions';
import {setShareItems} from 'wire/actions';
import {createOrUpdateTopic} from 'user-profile/actions';

import {multiSelectTopicsConfigSelector} from 'ui/selectors';
import {
    searchFilterSelector,
    searchNavigationSelector,
    searchCreatedSelector,
    searchTopicIdSelector,
    activeTopicSelector,
} from './selectors';

import {context} from 'selectors';

export const SET_QUERY = 'SET_QUERY';
export function setQuery(query) {
    return function(dispatch, getState) {
        query && analytics.event('search', query);
        dispatch(setSearchQuery(query));
        updateRouteParams(
            {q: query},
            getState()
        );
    };
}

export const TOGGLE_TOPIC = 'TOGGLE_TOPIC';
export function toggleTopic(topic) {
    return {type: TOGGLE_TOPIC, topic};
}

export const ADD_TOPIC = 'ADD_TOPIC';
export function addTopic(topic) {
    return {type: ADD_TOPIC, topic};
}

export const SET_NEW_ITEMS_BY_TOPIC = 'SET_NEW_ITEMS_BY_TOPIC';
export function setNewItemsByTopic(data) {
    return {type: SET_NEW_ITEMS_BY_TOPIC, data};
}

export function loadTopics(user) {
    return server.get(`/users/${user}/topics`);
}

export const SET_TOPICS = 'SET_TOPICS';
export function setTopics(topics) {
    return {type: SET_TOPICS, topics};
}

export const TOGGLE_NAVIGATION = 'TOGGLE_NAVIGATION';
export function toggleNavigation(navigation, disableSameNavigationDeselect) {
    return (dispatch, getState) => {
        const state = getState();
        const currentNavigation = searchNavigationSelector(state);
        let newNavigation = [...currentNavigation];
        const navigationId = get(navigation, '_id') || navigation;

        if (!navigationId) {
            // If no id has been provided, then we select all topics
            newNavigation = [];
        } else if (multiSelectTopicsConfigSelector(state)) {
            // If multi selecting topics is enabled for this section
            if (currentNavigation.includes(navigationId)) {
                // The navigation is already selected, so deselect it
                newNavigation = newNavigation.filter(
                    (navId) => navId !== navigationId
                );
            } else {
                // The navigation is not selected, so select it now
                newNavigation.push(navigationId);
            }
        } else {
            // If multi selecting topics is disabled for this section
            if (get(currentNavigation, '[0]') === navigationId && !disableSameNavigationDeselect) {
                // The navigation is already selected, so deselect it
                newNavigation = [];
            } else {
                // The navigation is not selected, so select it now
                newNavigation = [navigationId];
            }
        }

        dispatch(resetSearchParams());
        dispatch(setSearchNavigationIds(newNavigation));
        updateRouteParams(
            {
                topic: null,
                q: null,
                created: null,
                navigation: getNavigationUrlParam(newNavigation, false),
                filter: null,
                product: null,
            },
            state
        );
    };
}

export const TOGGLE_FILTER = 'TOGGLE_FILTER';
export function toggleFilter(key, value, single) {
    return function(dispatch, getState) {
        const state = getState();
        const currentFilters = cloneDeep(searchFilterSelector(state));

        currentFilters[key] = toggleValue(currentFilters[key], value);

        if (!value || !currentFilters[key] || currentFilters[key].length === 0) {
            delete currentFilters[key];
        } else if (single) {
            currentFilters[key] = currentFilters[key].filter(
                (val) => val === value
            );
        }

        dispatch(setSearchFilters(currentFilters));
        updateRouteParams(
            {filter: currentFilters},
            state,
            false
        );
    };
}

export const SET_CREATED_FILTER = 'SET_CREATED_FILTER';
export function setCreatedFilter(filter) {
    return function(dispatch, getState) {
        const state = getState();

        // Combine the current created filter with the one provided
        // (removing keys where the value is null)
        const created = pickBy(
            assign(
                cloneDeep(searchCreatedSelector(state)),
                filter
            )
        );

        dispatch(setSearchCreated(created));
        updateRouteParams(
            {created},
            state,
            false
        );
    };
}

export const RESET_FILTER = 'RESET_FILTER';
export function resetFilter(filter) {
    return function(dispatch, getState) {
        updateRouteParams({
            filter: null,
            created: null,
        }, getState());
        dispatch({type: RESET_FILTER, filter});
    };
}

export const SET_VIEW = 'SET_VIEW';
export function setView(view) {
    localStorage.setItem('view', view);
    return {type: SET_VIEW, view};
}

/**
 * Start a follow topic action
 *
 * @param {Object} searchParams
 */
export function saveMyTopic(searchParams) {
    const type = get(searchParams, 'topic_type') || 'wire';

    const menu = type === 'agenda' ?
        'events' :
        'topics';

    if (!get(searchParams, 'label')) {
        searchParams.label = get(searchParams, 'query.length', 0) > 0 ?
            searchParams.query :
            '';
    }

    createOrUpdateTopic(menu, searchParams, true);
}

export function followStory(item, type) {
    const slugline = get(item, 'slugline');

    saveMyTopic({
        label: slugline,
        query: `slugline:"${slugline}"`,
        topic_type: type,
    });
}

/**
 * Toggle navigation by id
 *
 * @param {String} navigationId
 */
export function toggleNavigationById(navigationId) {
    return (dispatch, getState) => {
        const navigation = (get(getState().search, 'navigations') || []).find((nav) => navigationId === nav._id);
        if (navigation) {
            dispatch(toggleNavigation(navigation));
        }
    };
}

/**
 * Toggle navigation by ids
 *
 * @param {Array<String>} navigationIds
 */
export function toggleNavigationByIds(navigationIds) {
    return (dispatch, getState) => {
        const navigations = (get(getState().search, 'navigations') || []);

        toggleNavigation();
        navigations
            .filter((nav) => navigationIds.includes(nav._id))
            .forEach((nav) => dispatch(toggleNavigation(nav)));
    };
}

export function submitFollowTopic(data) {
    return (dispatch, getState) => {
        const user = getState().user;
        const userId = get(user, '_id') || user;

        const url = `/users/${userId}/topics`;
        data.timezone_offset = getTimezoneOffset();
        return server.post(url, data)
            .then((updates) => {
                const topic = Object.assign(data, updates);

                dispatch(addTopic(topic));
                dispatch(closeModal());
                return topic;
            })
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
        const userContext = context(getState());
        const type = userContext || data.items[0].topic_type;
        data.maps = [];
        let url = 'wire_share';
        if (userContext === 'monitoring') {
            url = 'monitoring/share';
            data.monitoring_profile = get(getState(), 'search.activeNavigation[0]');
        }
        
        if (type === 'agenda') {
            data.items.map((_id) => data.maps.push(getMapSource(getLocations(getState().itemsById[_id]), 2)));
        }
        return server.post(`/${url}?type=${type}`, data)
            .then(() => {
                dispatch(closeModal());
                dispatch(setShareItems(data.items));
                if (data.items.length > 1) {
                    notify.success(gettext('Items were shared successfully.'));
                } else {
                    notify.success(gettext('Item was shared successfully.'));
                }
            })
            .then(() => analytics.multiItemEvent('share', data.items.map((_id) => getState().itemsById[_id])))
            .catch(errorHandler);
    };
}

export function loadMyTopic(topicId) {
    return (dispatch, getState) => {
        const state = getState();
        const currentTopicId = searchTopicIdSelector(state);
        const nextTopicId = topicId === currentTopicId ? null : topicId;

        dispatch(resetSearchParams());
        dispatch(setSearchTopicId(nextTopicId));
        updateRouteParams({
            topic: nextTopicId,
            q: null,
            created: null,
            navigation: null,
            filter: null,
        }, state);

        dispatch(updateSearchParams());
    };
}

export function updateSearchParams() {
    return function(dispatch, getState) {
        dispatch(setParams(
            activeTopicSelector(getState())
        ));
    };
}

export const SET_SEARCH_TOPIC_ID = 'SET_SEARCH_TOPIC_ID';
export function setSearchTopicId(topicId) {
    return {type: SET_SEARCH_TOPIC_ID, payload: topicId};
}

export const SET_SEARCH_NAVIGATION_IDS = 'SET_SEARCH_NAVIGATION_IDS';
export function setSearchNavigationIds(navIds) {
    return {type: SET_SEARCH_NAVIGATION_IDS, payload: navIds};
}

export const SET_SEARCH_QUERY = 'SET_SEARCH_QUERY';
export function setSearchQuery(query) {
    if (query) {
        analytics.event('search', query);
    }

    return {type: SET_SEARCH_QUERY, payload: query};
}

export const SET_SEARCH_FILTERS = 'SET_SEARCH_FILTERS';
export function setSearchFilters(filters) {
    return {type: SET_SEARCH_FILTERS, payload: filters};
}

export const SET_SEARCH_CREATED = 'SET_SEARCH_CREATED';
export function setSearchCreated(created) {
    return {type: SET_SEARCH_CREATED, payload: created};
}

export const SET_SEARCH_PRODUCT = 'SET_SEARCH_PRODUCT';
export function setSearchProduct(productId) {
    return {type: SET_SEARCH_PRODUCT, payload: productId};
}

export const RESET_SEARCH_PARAMS = 'RESET_SEARCH_PARAMS';
export function resetSearchParams() {
    return {type: RESET_SEARCH_PARAMS};
}

export function setParams(params) {
    return function(dispatch) {
        if (get(params, 'created')) {
            dispatch(setSearchCreated(params.created));
        }

        if (get(params, 'query')) {
            dispatch(setSearchQuery(params.query));
        }

        if (get(params, 'navigation.length', 0) > 0) {
            dispatch(setSearchNavigationIds(params.navigation));
        }

        if (get(params, 'filter')) {
            dispatch(setSearchFilters(params.filter));
        }

        if (get(params, 'product')) {
            dispatch(setSearchProduct(params.product));
        }
    };
}

/**
 * Set state on app init using url params
 *
 * @param {URLSearchParams} params
 */
export function initParams(params) {
    return (dispatch, getState) => {
        const custom = {
            query: params.get('q'),
            created: params.get('created') ? JSON.parse(params.get('created')) : null,
            navigation: params.get('navigation') ? JSON.parse(params.get('navigation')) : null,
            filter: params.get('filter') ? JSON.parse(params.get('filter')) : null,
            product: params.get('product'),
        };
        let topic = {};

        if (params.get('topic')) {
            dispatch(setSearchTopicId(params.get('topic')));
            topic = activeTopicSelector(getState());
        }

        dispatch(
            setParams(
                getSearchParams(custom, topic)
            )
        );
    };
}
