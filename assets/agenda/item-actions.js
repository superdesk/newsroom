import {get} from 'lodash';
import {getItemActions} from '../item-actions';
import * as agendaActions from './actions';
import {gettext} from '../utils';
import {isWatched} from './utils';

const canWatchAgendaItem = (state, item) => {
    let result = state.user && !isWatched(item, state.user);
    if (!state.bookmarks) {
        return result;
    }

    const coveragesWatched = (get(item, 'coverages') || []).filter((c) => isWatched(c, state.user));
    return coveragesWatched.length > 0 ? false : result;
};

export const getAgendaItemActions = (dispatch) => {
    const { watchEvents, stopWatchingEvents } = agendaActions;
    return getItemActions(dispatch, { ...agendaActions }).concat([
        {
            name: gettext('Watch'),
            icon: 'watch',
            multi: true,
            when: (state, item) => canWatchAgendaItem(state, item),
            action: (items) => dispatch(watchEvents(items)),
        },
        {
            name: gettext('Stop watching'),
            icon: 'unwatch',
            multi: true,
            when: (state, item) => !canWatchAgendaItem(state, item),
            action: (items) => dispatch(stopWatchingEvents(items)),
        },
    ]);
};

export const getCoverageItemActions = (dispatch) => {
    const { watchCoverage, stopWatchingCoverage } = agendaActions;
    return [
        {
            name: gettext('Watch'),
            icon: 'watch',
            when: (cov, user) => user && !isWatched(cov, user),
            action: (coverage, group, item) => dispatch(watchCoverage(coverage, item)),
            tooltip: gettext('Watch this coverage'),
        },
        {
            name: gettext('Stop watching'),
            icon: 'unwatch',
            when: (cov, user) => user && isWatched(cov, user),
            action: (coverage, group, item) => dispatch(stopWatchingCoverage(coverage, item)),
        },
    ];
};

