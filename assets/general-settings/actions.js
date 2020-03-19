import server from 'server';
import {errorHandler} from '../utils';
import { gettext, notify } from 'utils';

export const UPDATE_VALUES = 'UPDATE_VALUES';
function updateValues(data) {
    return {type: UPDATE_VALUES, data};
}

export function save(values) {
    return (dispatch) => {
        server.post('/settings/general_settings', values)
            .then((data) => {
                notify.success(gettext('Settings were updated successfully.'));
                dispatch(updateValues(data));
            }, (reason) => errorHandler(reason));
    };
}

export const INIT_VIEW_DATA = 'INIT_VIEW_DATA';
export function initViewData(data) {
    return {type: INIT_VIEW_DATA, data: data};
}
