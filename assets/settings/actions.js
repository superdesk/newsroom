import { gettext, notify } from 'utils';
import server from 'server';


export const SELECT_ITEM = 'SELECT_ITEM';
export function selectItem(id) {
    return function (dispatch) {
        dispatch(select(id));
        dispatch(fetchCompanyUsers(id));
    };
}

function select(id) {
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

export const NEW_PRODUCT = 'NEW_PRODUCT';
export function newProduct() {
    return {type: NEW_PRODUCT};
}

export const CANCEL_EDIT = 'CANCEL_EDIT';
export function cancelEdit(event) {
    return {type: CANCEL_EDIT, event};
}

export const SAVE_ITEM = 'SAVE_ITEM';

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

export const GET_COMPANY_USERS = 'GET_COMPANY_USERS';
export function getCompanyUsers(data) {
    return {type: GET_COMPANY_USERS, data};
}

export const GET_ITEMS = 'GET_ITEMS';
export function getItems(data) {
    return {type: GET_ITEMS, data};
}

export const GET_PRODUCTS = 'GET_PRODUCTS';
export function getProducts(data) {
    return {type: GET_PRODUCTS, data};
}

export const SET_ERROR = 'SET_ERROR';
export function setError(errors) {
    return {type: SET_ERROR, errors};
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
        notify.error(error.response.statusText);
        return;
    }
    error.response.json().then(function(data) {
        dispatch(setError(data));
    });
}




/**
 * Fetches users and companies for the time being
 *
 * @param {String} type either users or companies
 */
export function fetchItems(type) {
    return function (dispatch, getState) {
        dispatch(queryItems());
        const query = getState().query || '';

        return server.get(`/${type}/search?q=${query}`)
            .then((data) => {
                dispatch(getItems(data));
                if (type === 'companies') {
                    dispatch(getCompanies(data, type));
                }
            })
            .catch((error) => errorHandler(error, dispatch));
    };
}

/**
 * Fetches users of a company
 *
 * @param {String} companyId
 */
export function fetchCompanyUsers(companyId) {
    return function (dispatch, getState) {
        if (!getState().itemsById[companyId].name) {
            return;
        }

        return server.get(`/companies/${companyId}/users`)
            .then((data) => {
                return dispatch(getCompanyUsers(data));
            })
            .catch((error) => errorHandler(error, dispatch));
    };
}

/**
 * Fetches users of a company
 *
 * @param {String} companyId
 */
export function fetchCompanies() {
    return function (dispatch, getState) {
        if (!getState().itemsById[companyId].name) {
            return;
        }

        return server.get(`/companies`)
            .then((data) => {
                return dispatch(getCompanies(data));
            })
            .catch((error) => errorHandler(error, dispatch));
    };
}

/**
 * Fetches products
 *
 */
export function fetchProducts() {
    return function (dispatch) {
        return server.get(`/products`)
            .then((data) => {
                return dispatch(getItems(data));
                //return dispatch(getProducts(data));
            })
            .catch((error) => errorHandler(error, dispatch));
    };
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
            .then(function() {
                notify.success(gettext((item._id ? 'Item updated' : 'Item created') + 'successfully'));
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
            .then(() => notify.success(gettext('Reset password token is sent successfully')))
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
            .then(() => {
                notify.success(gettext('Item deleted successfully'));
                dispatch(fetchItems(type));
            })
            .catch((error) => errorHandler(error, dispatch));
    };
}

export const INIT_VIEW_DATA = 'INIT_VIEW_DATA';
export function initViewData(data) {
    return {type: INIT_VIEW_DATA, data};
}

export const UPDATE_ITEM = 'UPDATE_ITEM';
export function updateItem(item, field, data) {
    return {type: UPDATE_ITEM, item, field, data};
}

export function saveServices(services) {
    return function (dispatch, getState) {
        const item = getState().itemToEdit;
        return server.post(`/companies/${item._id}/services`, {services})
            .then(() => dispatch(updateItem(item, 'services', services)))
            .catch((error) => errorHandler(error, dispatch));
    };
}

export function saveCompanies(companies) {
    return function (dispatch, getState) {
        const item = getState().itemToEdit;
        return server.post(`/products/${item._id}/companies`, {companies})
            .then(() => dispatch(updateItem(item, 'companies', companies)))
            .catch((error) => errorHandler(error, dispatch));
    };
}
