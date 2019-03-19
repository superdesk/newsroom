import server from 'server';
import {errorHandler} from '../utils';
import { gettext, notify } from 'utils';

export const UPDATE_VALUES = 'UPDATE_VALUES';
function updateValues(values) {
    return {type: UPDATE_VALUES, values: values};
}

export function save(values) {
    return (dispatch) => {
        server.post('/settings/general_settings', values)
            .then(() => {
                notify.success(gettext('Settings were updated successfully.'));
                dispatch(updateValues(values));
            }, (reason) => errorHandler(reason));
    };
}

export const INIT_VIEW_DATA = 'INIT_VIEW_DATA';
export function initViewData(data) {
    return {type: INIT_VIEW_DATA, data: data};
}
