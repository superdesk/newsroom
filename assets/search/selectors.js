
import { createSelector } from 'reselect';
import { get, isEmpty } from 'lodash';
import { getActiveQuery, isTopicActive } from 'wire/utils';

const activeQuerySelector = (state) => state.activeQuery;
const activeFilterSelector = (state) => get(state, 'search.activeFilter');
const createdFilterSelector = (state) => get(state, 'search.createdFilter');
const topicsSelector = (state) => get(state, 'topics', []);

export const searchCriteriaSelector = createSelector([
    activeQuerySelector,
    activeFilterSelector,
    createdFilterSelector,
], getActiveQuery);

export const resultsFilteredSelector = (state) => !isEmpty(get(state, 'search.activeFilter')) || !isEmpty(get(state, 'search.createdFilter'));

export const activeTopicSelector = createSelector(
    [topicsSelector, searchCriteriaSelector],
    (topics, searchCriteria) => topics.find((topic) => isTopicActive(topic, searchCriteria))
);
