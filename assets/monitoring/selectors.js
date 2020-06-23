import {get} from 'lodash';
import {createSelector} from 'reselect';

export const monitoringProfileToEdit = (state) => get(state, 'monitoringProfileToEdit') || null;
export const company = (state) => get(state, 'company') || null;
export const scheduleMode = (state) => get(state, 'scheduleMode') || false;
export const monitoringListById = (state) => get(state, 'monitoringListById') || null;
export const monitoringProfileList = (state) => get(state, 'monitoringList') || null;

export const monitoringList = createSelector([monitoringListById, monitoringProfileList, scheduleMode],
    (pById, ps, sched) => {
        const allProfiles = ps.map((id) => pById[id]);
        if (!sched) {
            return allProfiles;
        }

        return allProfiles.filter((p) => get(p, 'schedule.interval'));
    });
