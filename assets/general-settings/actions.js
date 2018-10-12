import server from 'server';
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
            }, (reason) => {
                console.error('error', reason);
                notify.error(gettext('Oops, there was an error when updating settings.'));
            });
    };
}

export const INIT_VIEW_DATA = 'INIT_VIEW_DATA';
export function initViewData(data) {
    return {type: INIT_VIEW_DATA, data: data};
}
