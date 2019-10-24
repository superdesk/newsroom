import {createSelector} from 'reselect';
import {get, find, filter as removeNulls, isEqual, isEmpty} from 'lodash';

export const searchQuerySelector = (state) => get(state, 'search.activeQuery') || null;
export const searchFilterSelector = (state) => get(state, 'search.activeFilter');
export const searchCreatedSelector = (state) => get(state, 'search.createdFilter');
export const searchNavigationSelector = (state) => get(state, 'search.activeNavigation') || [];
export const searchTopicIdSelector = (state) => get(state, 'search.activeTopic') || null;

export const activeViewSelector = (state) => get(state, 'search.activeView');
export const navigationsSelector = (state) => get(state, 'search.navigations') || [];

export const topicsSelector = (state) => get(state, 'topics') || [];

export const activeTopicSelector = createSelector(
    [searchTopicIdSelector, topicsSelector],
    (topicId, topics) => find(topics, {'_id': topicId})
);

export const resultsFilteredSelector = (state) => state.resultsFiltered;

export const searchParamsSelector = createSelector(
    [searchQuerySelector, searchCreatedSelector, searchNavigationSelector, searchFilterSelector],
    (query, created, navigation, filter) => {
        const params = {};

        if (!isEmpty(query)) {
            params.query = query;
        }

        if (!isEmpty(created)) {
            params.created = created;
        }

        if (!isEmpty(navigation)) {
            params.navigation = navigation;
        }

        if (filter && Object.keys(filter).length > 0) {
            params.filter = {};
            Object.keys(filter).forEach((key) => {
                const value = removeNulls(filter[key]);

                if (value && value.length > 0) {
                    params.filter[key] = value;
                }
            });

            if (isEmpty(params.filter)) {
                delete params.filter;
            }
        }

        return params;
    }
);

export const showSaveTopicSelector = createSelector(
    [searchParamsSelector, activeTopicSelector],
    (current, topic) => {
        if (!topic) {
            if (isEqual(current, {})) {
                return false;
            }

            // If there is only a single navigation selected, then don't enable the 'SAVE' button
            return !(
                isEqual(Object.keys(current), ['navigation']) &&
                get(current, 'navigation.length', 0) === 1
            );
        } else if (!isEqual(get(current, 'query'), get(topic, 'query'))) {
            return true;
        } else if (!isEqual(get(current, 'created'), get(topic, 'created'))) {
            return true;
        } else if (!isEqual(get(current, 'filter'), get(topic, 'filter'))) {
            return true;
        }

        return !isEqual(
            (get(current, 'navigation') || []).sort(),
            (get(topic, 'navigation') || []).sort()
        );
    }
);
