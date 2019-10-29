import {get} from 'lodash';
import {createSelector} from 'reselect';

export const watchListToEdit = (state) => get(state, 'watchListToEdit') || null;
export const company = (state) => get(state, 'company') || null;
export const scheduleMode = (state) => get(state, 'scheduleMode') || false;
export const watchListsById = (state) => get(state, 'watchListsById') || null;
export const watchLists = (state) => get(state, 'watchLists') || null;

export const watchListsList = createSelector([watchListsById, watchLists, scheduleMode],
    (wlById, wls, sched) => {
        const allWatchLists = wls.map((id) => wlById[id]);
        if (!sched) {
            return allWatchLists;
        }

        return allWatchLists.filter((w) => get(w, 'schedule.interval'));
    });
