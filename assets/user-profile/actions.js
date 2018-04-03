import { gettext, notify, errorHandler } from 'utils';
import server from 'server';
import { renderModal, closeModal } from 'actions';

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


export const SELECT_MENU = 'SELECT_MENU';
export function selectMenu(data) {
    return {type: SELECT_MENU, data};
}

export const TOGGLE_DROPDOWN = 'TOGGLE_DROPDOWN';
export function toggleDropdown() {
    return {type: TOGGLE_DROPDOWN};
}

export const HIDE_MODAL = 'HIDE_MODAL';
export function hideModal() {
    return {type: HIDE_MODAL};
}


/**
 * Fetches user details
 */
export function fetchUser(id) {
    return function (dispatch) {
        return server.get(`/users/${id}`)
            .then((data) => {
                dispatch(getUser(data));
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

/**
 * Saves a user
 *
 */
export function saveUser() {
    return function (dispatch, getState) {

        const editedUser = getState().editedUser;
        const url = `/users/${editedUser._id}`;

        return server.post(url, editedUser)
            .then(function() {
                notify.success(gettext('User updated successfully'));
                dispatch(fetchUser(editedUser._id));
            })
            .catch((error) => errorHandler(error, dispatch, setError));

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
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

export function editTopic(topic) {
    return renderModal('followTopic', {topic});
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
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

/**
 * Start share followed topic - display modal to pick users
 *
 * @return {function}
 */
export function shareTopic(items) {
    return (dispatch, getState) => {
        const user = getState().user;
        const company = getState().company;
        return server.get(`/companies/${company}/users`)
            .then((users) => users.filter((u) => u._id !== user._id))
            .then((users) => dispatch(renderModal('shareItem', {items, users})))
            .catch(errorHandler);
    };
}

/**
 * Submit share followed topic form and close modal if that works
 *
 * @param {Object} data
 */
export function submitShareTopic(data) {
    return (dispatch) => {
        return server.post('/topic_share', data)
            .then(() => {
                notify.success(gettext('Topic was shared successfully.'));
                dispatch(closeModal());
            })
            .catch(errorHandler);
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
