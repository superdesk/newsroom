import {getItemActions} from '../item-actions';
import * as agendaActions from './actions';
import {gettext} from '../utils';
import {isWatched} from './utils';
import { get, includes } from 'lodash';


export default (dispatch) => {
    const { watchEvents, stopWatchingEvents } = agendaActions;
    return getItemActions(dispatch, { ...agendaActions }).concat([
        {
            name: gettext('Watch'),
            icon: 'watch',
            multi: true,
            when: (state, item) => state.user && !includes(get(item, 'watches', []), state.user),
            action: (items) => dispatch(watchEvents(items)),
        },
        {
            name: gettext('Stop watching'),
            icon: 'unwatch',
            multi: true,
            when: (state, item) => isWatched(item, state.user),
            action: (items) => dispatch(stopWatchingEvents(items)),
        },
    ]);
};