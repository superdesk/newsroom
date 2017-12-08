import { gettext, notify } from 'utils';
import server from 'server';


export const SELECT_PRODUCT = 'SELECT_PRODUCT';
export function selectProduct(id) {
    return {type: SELECT_PRODUCT, id};
}

export const EDIT_PRODUCT = 'EDIT_PRODUCT';
export function editProduct(event) {
    return {type: EDIT_PRODUCT, event};
}

export const NEW_PRODUCT = 'NEW_PRODUCT';
export function newProduct(data) {
    return {type: NEW_PRODUCT, data};
}

export const CANCEL_EDIT = 'CANCEL_EDIT';
export function cancelEdit(event) {
    return {type: CANCEL_EDIT, event};
}

export const SET_QUERY = 'SET_QUERY';
export function setQuery(query) {
    return {type: SET_QUERY, query};
}

export const QUERY_PRODUCTS = 'QUERY_PRODUCTS';
export function queryProducts() {
    return {type: QUERY_PRODUCTS};
}

export const GET_PRODUCTS = 'GET_PRODUCTS';
export function getProducts(data) {
    return {type: GET_PRODUCTS, data};
}

export const GET_COMPANIES = 'GET_COMPANIES';
export function getCompanies(data) {
    return {type: GET_COMPANIES, data};
}

export const GET_NAVIGATIONS = 'GET_NAVIGATIONS';
export function getNavigations(data) {
    return {type: GET_NAVIGATIONS, data};
}

export const UPDATE_PRODUCT_COMPANIES = 'UPDATE_PRODUCT_COMPANIES';
export function updateProductCompanies(product, companies) {
    return {type: UPDATE_PRODUCT_COMPANIES, product, companies};
}

export const SET_ERROR = 'SET_ERROR';
export function setError(errors) {
    return {type: SET_ERROR, errors};
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
 * Fetches products
 *
 */
export function fetchProducts() {
    return function (dispatch, getState) {
        dispatch(queryProducts());
        const query = getState().query || '';

        return server.get(`/products/search?q=${query}`)
            .then((data) => dispatch(getProducts(data)))
            .catch((error) => errorHandler(error, dispatch));
    };
}


/**
 * Creates new products
 *
 */
export function postProduct() {
    return function (dispatch, getState) {

        const product = getState().productToEdit;
        const url = `/products/${product._id ? product._id : 'new'}`;

        return server.post(url, product)
            .then(function() {
                notify.success(gettext((product._id ? 'Product updated' : 'Product created') + 'successfully'));
                dispatch(fetchProducts());
            })
            .catch((error) => errorHandler(error, dispatch));

    };
}


/**
 * Deletes a product
 *
 */
export function deleteProduct() {
    return function (dispatch, getState) {

        const product = getState().productToEdit;
        const url = `/products/${product._id}`;

        return server.del(url)
            .then(() => {
                notify.success(gettext('Product deleted successfully'));
                dispatch(fetchProducts());
            })
            .catch((error) => errorHandler(error, dispatch));
    };
}


/**
 * Fetches companies
 *
 */
export function fetchCompanies() {
    return function (dispatch) {
        return server.get('/companies/search')
            .then((data) => {
                dispatch(getCompanies(data));
            })
            .catch((error) => errorHandler(error, dispatch));
    };
}

/**
 * Saves companies for a product
 *
 */
export function saveCompanies(companies) {
    return function (dispatch, getState) {
        const product = getState().productToEdit;
        return server.post(`/products/${product._id}/companies`, {companies})
            .then(() => dispatch(updateProductCompanies(product, companies)))
            .catch((error) => errorHandler(error, dispatch));
    };
}

export function initViewData(data) {
    return function (dispatch) {
        dispatch(getProducts(data.products));
        dispatch(getCompanies(data.companies));
    };
}

