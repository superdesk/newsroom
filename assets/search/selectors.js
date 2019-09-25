
import { createSelector } from 'reselect';
import { get } from 'lodash';
import { getActiveQuery, isTopicActive } from 'wire/utils';

export const activeQuerySelector = (state) => get(state, 'activeQuery') || null;
export const activeViewSelector = (state) => get(state, 'search.activeView');
export const activeFilterSelector = (state) => get(state, 'search.activeFilter');
export const createdFilterSelector = (state) => get(state, 'search.createdFilter');
export const activeNavigationSelector = (state) => get(state, 'search.activeNavigation') || [];
export const navigationsSelector = (state) => get(state, 'search.navigations') || [];
export const topicsSelector = (state) => get(state, 'topics') || [];

export const searchCriteriaSelector = createSelector([
    activeQuerySelector,
    activeFilterSelector,
    createdFilterSelector,
], getActiveQuery);

export const resultsFilteredSelector = (state) => state.resultsFiltered;

export const activeTopicSelector = createSelector(
    [topicsSelector, searchCriteriaSelector],
    (topics, searchCriteria) => topics.find((topic) => isTopicActive(topic, searchCriteria))
);
