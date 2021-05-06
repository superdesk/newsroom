import {gettext, notify, errorHandler} from 'utils';
import server from 'server';
import {searchQuerySelector} from 'search/selectors';
import {get} from 'lodash';

export const SELECT_USER = 'SELECT_USER';
export function selectUser(id) {
    return function (dispatch) {
        dispatch(select(id));
    };
}

function select(id) {
    return {type: SELECT_USER, id};
}

export const GET_USER = 'GET_USER';
export function getUser(user) {
    return {type: GET_USER, user};
}

export const EDIT_USER = 'EDIT_USER';
export function editUser(event) {
    return {type: EDIT_USER, event};
}

export const NEW_USER = 'NEW_USER';
export function newUser(data) {
    return {type: NEW_USER, data};
}

export const CANCEL_EDIT = 'CANCEL_EDIT';
export function cancelEdit(event) {
    return {type: CANCEL_EDIT, event};
}

export const QUERY_USERS = 'QUERY_USERS';
export function queryUsers() {
    return {type: QUERY_USERS};
}

export const GET_USERS = 'GET_USERS';
export function getUsers(data) {
    return {type: GET_USERS, data};
}

export const GET_COMPANIES = 'GET_COMPANIES';
export function getCompanies(data) {
    return {type: GET_COMPANIES, data};
}

export const SET_ERROR = 'SET_ERROR';
export function setError(errors) {
    return {type: SET_ERROR, errors};
}

export const SET_COMPANY = 'SET_COMPANY';
export function setCompany(company) {
    return {type: SET_COMPANY, company};
}

export const SET_SORT = 'SET_SORT';
export function setSort(param) {
    return {type: SET_SORT, param};
}

export const TOGGLE_SORT_DIRECTION = 'TOGGLE_SORT_DIRECTION';
export function toggleSortDirection() {
    return {type: TOGGLE_SORT_DIRECTION};
}

/**
 * Fetches users
 *
 */
export function fetchUsers() {
    return function (dispatch, getState) {
        dispatch(queryUsers());
        const query = searchQuerySelector(getState()) || '';
        const filter = getState().company &&
            getState().company !== '' ? '&where={"company":"' + getState().company + '"}' : '';
        const sort = !getState().sort ? '' :
            `&sort=[("${getState().sort}", ${getState().sortDirection}), ("last_name", 1)]`;

        return server.get(`/users/search?q=${query}${filter}${sort}`)
            .then((data) => dispatch(getUsers(data)))
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}


/**
 * Creates new users
 *
 */
export function postUser() {
    return function (dispatch, getState) {

        const user = getState().userToEdit;
        const url = `/users/${user._id ? user._id : 'new'}`;

        return server.post(url, user)
            .then(function() {
                if (user._id) {
                    notify.success(gettext('User updated successfully'));
                } else {
                    notify.success(gettext('User created successfully'));
                }
                dispatch(fetchUsers());
            })
            .catch((error) => errorHandler(error, dispatch, setError));

    };
}


export function resetPassword() {
    return function (dispatch, getState) {

        const user = getState().userToEdit;
        const url = `/users/${user._id}/reset_password`;

        return server.post(url, {})
            .then(() => notify.success(gettext('Reset password token is sent successfully')))
            .catch((error) => errorHandler(error, dispatch, setError));

    };
}

/**
 * Deletes a user
 *
 */
export function deleteUser() {
    return function (dispatch, getState) {

        const user = getState().userToEdit;
        const url = `/users/${user._id}`;

        return server.del(url)
            .then(() => {
                notify.success(gettext('User deleted successfully'));
                dispatch(fetchUsers());
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

export function initViewData(data) {
    return function (dispatch) {
        dispatch(getUsers(data.users));
        dispatch(getCompanies(data.companies));
        dispatch(getUser(get(window.profileData, 'user', {})));
        //return {type: INIT_VIEW_DATA, data};
    };
}

