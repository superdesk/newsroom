import { gettext, notify, errorHandler } from 'utils';
import server from 'server';


export const NEW_NOTIFICATION = 'NEW_NOTIFICATION';
export function newNotification(notification) {
    return {type: NEW_NOTIFICATION, notification};
}



export const INIT_DATA = 'INIT_DATA';
export function initData(data) {
    return {type: INIT_DATA, data};
}


export const CLEAR_ALL_NOTIFICATIONS = 'CLEAR_ALL_NOTIFICATIONS';
export function clearAllNotifications() {
    return {type: CLEAR_ALL_NOTIFICATIONS};
}


export const CLEAR_NOTIFICATION = 'CLEAR_NOTIFICATION';
export function clearNotification(id) {
    return {type: CLEAR_NOTIFICATION, id};
}


/**
 * Deletes the given notification of the user
 *
 */
export function deleteNotification(id) {
    return function (dispatch, getState) {
        const user = getState().user;
        const url = `/users/${user}/notifications/${user}_${id}`;
        return server.del(url)
            .then(() => {
                notify.success(gettext('Notification cleared successfully'));
                dispatch(clearNotification(id));
            })
            .catch((error) => errorHandler(error, dispatch));
    };
}


/**
 * Deletes all notifications for the user
 *
 */
export function deleteAllNotifications() {
    return function (dispatch, getState) {
        const user = getState().user;
        const url = `/users/${user}/notifications`;
        return server.del(url)
            .then(() => {
                notify.success(gettext('Notifications cleared successfully'));
                dispatch(clearAllNotifications());
            })
            .catch((error) => errorHandler(error, dispatch));
    };
}


/**
 * Handle server push notification
 *
 * @param {Object} push
 */
export function pushNotification(push) {
    return (dispatch, getState) => {
        const user = getState().user;
        switch (push.event) {
        case 'history_matches':
        case 'agenda_update':
            if (push.extra.users && push.extra.users.includes(user)) {
                return dispatch(newNotification(push.extra));
            }
            break;
        }
    };
}
