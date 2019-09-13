import { get } from 'lodash';
import analytics from 'analytics';
import { renderModal } from 'actions';
import {multiSelectTopicsConfigSelector} from '../ui/selectors';
import {activeNavigationSelector} from './selectors';


export const SET_QUERY = 'SET_QUERY';
export function setQuery(query) {
    query && analytics.event('search', query);
    return {type: SET_QUERY, query};
}

export const TOGGLE_TOPIC = 'TOGGLE_TOPIC';
export function toggleTopic(topic) {
    return {type: TOGGLE_TOPIC, topic};
}

export const TOGGLE_NAVIGATION = 'TOGGLE_NAVIGATION';
export function toggleNavigation(navigation) {
    return (dispatch, getState) => {
        const currentNavigation = activeNavigationSelector(getState());
        let newNavigation = [...currentNavigation];
        const navigationId = get(navigation, '_id');

        dispatch(setQuery(''));

        if (!navigationId) {
            // If no id has been provided, then we select all topics
            newNavigation = [];
        } else if (multiSelectTopicsConfigSelector(getState())) {
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
            if (get(currentNavigation, '[0]') === navigationId) {
                // The navigation is already selected, so deselect it
                newNavigation = [];
            } else {
                // The navigation is not selected, so select it now
                newNavigation = [navigationId];
            }
        }

        dispatch({
            type: TOGGLE_NAVIGATION,
            navigation: newNavigation
        });
    };
}

export const TOGGLE_FILTER = 'TOGGLE_FILTER';
export function toggleFilter(key, val, single) {
    return {type: TOGGLE_FILTER, key, val, single};
}

export const SET_CREATED_FILTER = 'SET_CREATED_FILTER';
export function setCreatedFilter(filter) {
    return {type: SET_CREATED_FILTER, filter};
}

export const RESET_FILTER = 'RESET_FILTER';
export function resetFilter(filter) {
    return {type: RESET_FILTER, filter};
}

export const SET_VIEW = 'SET_VIEW';
export function setView(view) {
    localStorage.setItem('view', view);
    return {type: SET_VIEW, view};
}

/**
 * Start a follow topic action
 *
 * @param {String} topic
 * @param {String} type
 */
export function followTopic(topic, type, navigation) {
    topic.topic_type = type;
    topic.navigation = navigation;
    return renderModal('followTopic', {topic});
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
 * Set state on app init using url params
 *
 * @param {URLSearchParams} params
 */
export function initParams(params) {
    return (dispatch) => {
        if (params.get('navigation')) {
            dispatch(toggleNavigationById(params.get('navigation')));
        }
        if (params.get('q')) {
            dispatch(setQuery(params.get('q')));
        }
        if (params.get('filter')) {
            const filters = JSON.parse(params.get('filter'));
            for (const filter in filters) {
                filters[filter].map(val => dispatch(toggleFilter(filter, val)));
            }
        }
        if (params.get('created')) {
            const dates = JSON.parse(params.get('created'));
            dispatch(setCreatedFilter(dates));
        }

    };
}
