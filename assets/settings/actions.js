import alertify from 'alertifyjs';
import { gettext } from 'utils';
import server from 'server';


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

export const SAVE_ERROR = 'SAVE_ERROR';
export function saveError(data) {
    return {type: SAVE_ERROR, data};
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

function errorHandler(error, dispatch) {
    console.error('error', error);

    if (error.response.status !== 400) {
        alertify.error(error.response.statusText);
        return;
    }
    parseJSON(error.response).then(function(data) {
        dispatch(saveError(data));
    });
}


function parseJSON(response) {
    return response.json();
}

/**
 * Fetches users and companies for the time being
 *
 * @param {String} type either users or companies
 */
export function fetchItems(type) {
    return function (dispatch) {
        dispatch(queryItems());

        return server.get(`/${type}/search`)
            .then(parseJSON)
            .then((data) => {
                dispatch(getItems(data));
                if (type === 'companies') {
                    dispatch(getCompanies(data, type));
                }
            })
            .catch((error) => errorHandler(error, dispatch));
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

/**
 * Creates new users and companies for the time being
 *
 * @param {String} type either users or companies
 */
export function postItem(type) {
    return function (dispatch, getState) {

        const item = getState().itemToEdit;
        const url = `/${type}/${item._id ? item._id : 'new'}`;

        return server.post(url, item)
            .then(checkStatus)
            .then(parseJSON)
            .then(function() {
                alertify.success(gettext((item._id ? 'Item updated' : 'Item created') + 'successfully'));
                dispatch(fetchItems(type));
            })
            .catch((error) => errorHandler(error, dispatch));

    };
}


export function resetPassword() {
    return function (dispatch, getState) {

        const item = getState().itemToEdit;
        const url = `/users/${item._id}/reset_password`;

        return server.post(url, {})
            .then(checkStatus)
            .then(parseJSON)
            .then(() => alertify.success(gettext('Reset password token is sent successfully')))
            .catch((error) => errorHandler(error, dispatch));

    };
}

/**
 * Deletes a user or company
 *
 * @param {String} type either users or companies
 */
export function deleteItem(type) {
    return function (dispatch, getState) {

        const item = getState().itemToEdit;
        const url = `/${type}/${item._id}`;

        return server.del(url)
            .then(checkStatus)
            .then(parseJSON)
            .then(() => {
                alertify.success(gettext('Item deleted successfully'));
                dispatch(fetchItems(type));
            })
            .catch((error) => errorHandler(error, dispatch));
    };
}
