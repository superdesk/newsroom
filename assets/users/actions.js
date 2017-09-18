import fetch from 'isomorphic-fetch';
import alertify from 'alertifyjs';


export const SELECT_USER = 'SELECT_USER';
export function selectUser(id) {
    return {type: SELECT_USER, id};
}

export const EDIT_USER = 'EDIT_USER';
export function editUser(event) {
    return {type: EDIT_USER, event};
}

export const CANCEL_EDIT = 'CANCEL_EDIT';
export function cancelEdit(event) {
    return {type: CANCEL_EDIT, event};
}

export const SAVE_USER = 'SAVE_USER';
export function saveUser(data) {
    return {type: SAVE_USER, data};
}

export const SAVE_ERROR = 'SAVE_ERROR';
export function saveError(data) {
    return {type: SAVE_ERROR, data};
}

export const RESET_PASSWORD = 'RESET_PASSWORD';
export function resetPassword(data) {
    return {type: RESET_PASSWORD, data};
}

export const SET_QUERY = 'SET_QUERY';
export function setQuery(query) {
    return {type: SET_QUERY, query};
}

export const QUERY_USERS = 'QUERY_USERS';
export function queryUsers() {
    return {type: QUERY_USERS};
}

export const GET_COMPANIES = 'GET_COMPANIES';
export function getCompanies(data) {
    return {type: GET_COMPANIES, data};
}

export const GET_USERS = 'GET_USERS';
export function getUsers(data) {
    return {type: GET_USERS, data};
}

export function fetchUsers() {
    return function (dispatch) {
        dispatch(queryUsers());

        return fetch('/users/search', {
            credentials: 'same-origin'
        })
            .then((response) => {
                return response.json();
            })
            .then((data) =>
                dispatch(getUsers(data))
            );
    };
}

export function fetchCompanies() {
    return function (dispatch) {

        return fetch('/companies/search', {
            credentials: 'same-origin'
        }).then((response) => {
            return response.json();
        })
            .then((data) =>
                dispatch(getCompanies(data))
            );

    };
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
}

function parseJSON(response) {
    return response.json();
}

export function postUser() {
    return function (dispatch, getState) {

        const user = getState().userToEdit;

        return fetch(`/users/${user._id}`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
            .then(checkStatus)
            .then(parseJSON)
            .then(function() {
                alertify.success('User updated successfully');
            }).catch(function(error) {
                parseJSON(error.response).then(function(datax) {
                    dispatch(saveError(datax));
                });
            });

    };
}
