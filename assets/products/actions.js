import {gettext, notify, errorHandler} from 'utils';
import server from 'server';
import {initSections} from 'features/sections/actions';
import {searchQuerySelector} from 'search/selectors';


export const SELECT_PRODUCT = 'SELECT_PRODUCT';
export function selectProduct(id) {
    return {type: SELECT_PRODUCT, id};
}

export const EDIT_PRODUCT = 'EDIT_PRODUCT';
export function editProduct(event) {
    return {type: EDIT_PRODUCT, event};
}

export const NEW_PRODUCT = 'NEW_PRODUCT';
export function newProduct() {
    return {type: NEW_PRODUCT};
}

export const CANCEL_EDIT = 'CANCEL_EDIT';
export function cancelEdit(event) {
    return {type: CANCEL_EDIT, event};
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

export const UPDATE_PRODUCT_NAVIGATIONS = 'UPDATE_PRODUCT_NAVIGATIONS';
export function updateProductNavigations(product, navigations) {
    return {type: UPDATE_PRODUCT_NAVIGATIONS, product, navigations};
}

export const SET_ERROR = 'SET_ERROR';
export function setError(errors) {
    return {type: SET_ERROR, errors};
}


/**
 * Fetches products
 *
 */
export function fetchProducts() {
    return function (dispatch, getState) {
        dispatch(queryProducts());
        const query = searchQuerySelector(getState()) || '';

        return server.get(`/products/search?q=${query}`)
            .then((data) => dispatch(getProducts(data)))
            .catch((error) => errorHandler(error, dispatch, setError));
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
                if (product._id) {
                    notify.success(gettext('Product updated successfully'));
                } else {
                    notify.success(gettext('Product created successfully'));
                }
                dispatch(fetchProducts());
            })
            .catch((error) => errorHandler(error, dispatch, setError));

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
            .catch((error) => errorHandler(error, dispatch, setError));
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
            .catch((error) => errorHandler(error, dispatch, setError));
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
            .then(() => {
                notify.success(gettext('Product updated successfully'));
                dispatch(updateProductCompanies(product, companies));
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

/**
 * Fetches navigations
 *
 */
export function fetchNavigations() {
    return function (dispatch) {
        return server.get('/navigations/search')
            .then((data) => {
                dispatch(getNavigations(data));
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

/**
 * Saves navigations for a product
 *
 */
export function saveNavigations(navigations) {
    return function (dispatch, getState) {
        const product = getState().productToEdit;
        return server.post(`/products/${product._id}/navigations`, {navigations})
            .then(() => {
                notify.success(gettext('Product updated successfully'));
                dispatch(updateProductNavigations(product, navigations));
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

export function initViewData(data) {
    return function (dispatch) {
        dispatch(getProducts(data.products));
        dispatch(getCompanies(data.companies));
        dispatch(getNavigations(data.navigations));
        dispatch(initSections(data.sections));
    };
}
