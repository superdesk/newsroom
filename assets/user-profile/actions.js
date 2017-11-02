import { gettext, notify } from 'utils';
import server from 'server';


export const GET_TOPICS = 'GET_TOPICS';
export function getTopics(topics) {
    return {type: GET_TOPICS, topics};
}

export const GET_USER = 'GET_USER';
export function getUser(user) {
    return {type: GET_USER, user};
}

export const EDIT_USER = 'EDIT_USER';
export function editUser(event) {
    return {type: EDIT_USER, event};
}

export const INIT_DATA = 'INIT_DATA';
export function initData(data) {
    return {type: INIT_DATA, data};
}

export const SET_ERROR = 'SET_ERROR';
export function setError(errors) {
    return {type: SET_ERROR, errors};
}

export const RENDER_MODAL = 'RENDER_MODAL';
export function renderModal(modal, data) {
    return {type: RENDER_MODAL, modal, data};
}

export const CLOSE_MODAL = 'CLOSE_MODAL';
export function closeModal() {
    return {type: CLOSE_MODAL};
}

export function updateMenu(data) {
    return function (dispatch) {
        if (data.target.name == 'topics') {
            dispatch(fetchTopics());
        }
        dispatch(selectMenu(data));
    };
}

export const SELECT_MENU = 'SELECT_MENU';
export function selectMenu(data) {
    return {type: SELECT_MENU, data};
}

function errorHandler(error, dispatch) {
    console.error('error', error);

    if (error.response.status !== 400) {
        notify.error(error.response.statusText);
        return;
    }
    error.response.json().then(function(data) {
        dispatch(setError(data));
    });
}


/**
 * Fetches user details
 */
export function fetchUser() {
    return function (dispatch, getState) {
        return server.get(`/users/${getState().user._id}`)
            .then((data) => {
                dispatch(getUser(data));
            })
            .catch((error) => errorHandler(error, dispatch));
    };
}

/**
 * Saves a user
 *
 */
export function saveUser() {
    return function (dispatch, getState) {

        const user = getState().user;
        const url = `/users/${user._id}`;

        return server.post(url, user)
            .then(function() {
                notify.success(gettext('User updated successfully'));
                dispatch(fetchUser());
            })
            .catch((error) => errorHandler(error, dispatch));

    };
}

/**
 * Fetches followed topics for the user
 *
 */
export function fetchTopics() {
    return function (dispatch, getState) {
        return server.get(`/users/${getState().user._id}/topics`)
            .then((data) => {
                return dispatch(getTopics(data._items));
            })
            .catch((error) => errorHandler(error, dispatch));
    };
}

export function editTopic(topic) {
    return renderModal('followTopic', topic);
}

/**
 * Deletes the given followed topic
 *
 */
export function deleteTopic(topic) {
    return function (dispatch) {
        const url = `/topics/${topic._id}`;
        return server.del(url)
            .then(() => {
                notify.success(gettext('Topic deleted successfully'));
                dispatch(fetchTopics());
            })
            .catch((error) => errorHandler(error, dispatch));
    };
}

export function shareTopic(topic) {
    return () => {
        return topic;
    };
}

/**
 * Updates a followed topic
 *
 */
export function submitFollowTopic(topic) {
    return (dispatch) => {
        const url = `/topics/${topic._id}`;
        return server.post(url, topic)
            .then(() => dispatch(fetchTopics()))
            .then(() => dispatch(closeModal()))
            .catch(errorHandler);
    };
}
