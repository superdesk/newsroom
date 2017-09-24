import fetch from 'isomorphic-fetch';
import alertify from 'alertifyjs';


export const SELECT_ITEM = 'SELECT_ITEM';
export function selectItem(id) {
    return {type: SELECT_ITEM, id};
}

export const EDIT_ITEM = 'EDIT_ITEM';
export function editItem(event) {
    return {type: EDIT_ITEM, event};
}

export const NEW_ITEM = 'NEW_ITEM';
export function newItem(data) {
    return {type: NEW_ITEM, data};
}

export const CANCEL_EDIT = 'CANCEL_EDIT';
export function cancelEdit(event) {
    return {type: CANCEL_EDIT, event};
}

export const SAVE_ITEM = 'SAVE_ITEM';
export function saveItem(data) {
    return {type: SAVE_ITEM, data};
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

export const QUERY_ITEMS = 'QUERY_ITEMS';
export function queryItems() {
    return {type: QUERY_ITEMS};
}

export const GET_COMPANIES = 'GET_COMPANIES';
export function getCompanies(data) {
    return {type: GET_COMPANIES, data};
}

export const GET_ITEMS = 'GET_ITEMS';
export function getItems(data) {
    return {type: GET_ITEMS, data};
}

export const UPDATE_MENU = 'UPDATE_MENU';
export function updateMenu(data) {
    return function (dispatch) {
        dispatch(fetchItems(data.target.name));
        dispatch(selectMenu(data));

    };
}

export const SELECT_MENU = 'SELECT_MENU';
export function selectMenu(data) {
    return {type: SELECT_MENU, data};
}

export function fetchItems(endpoint) {
    return function (dispatch) {
        dispatch(queryItems());

        return fetch(`/${endpoint}/search`, {
            credentials: 'same-origin'
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                dispatch(getItems(data));
                if (endpoint === 'companies') {
                    dispatch(getCompanies(data, endpoint));
                }
            });
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


export function postItem(type) {
    return function (dispatch, getState) {

        const item = getState().itemToEdit;

        return fetch(`/${type}/${item._id ? item._id : 'new'}`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        })
            .then(checkStatus)
            .then(parseJSON)
            .then(function() {
                alertify.success((item._id ? 'Item updated' : 'Item created') + 'successfully');
                dispatch(fetchItems(type));
            }).catch(function(error) {
                if (error.response.status !== 400) {
                    alertify.error(error.response.statusText);
                    return;
                }
                parseJSON(error.response).then(function(data) {
                    dispatch(saveError(data));
                });
            });

    };
}
