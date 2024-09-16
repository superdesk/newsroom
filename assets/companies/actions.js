import {gettext, notify, errorHandler} from 'utils';
import server from 'server';
import {searchQuerySelector} from 'search/selectors';


export const SELECT_COMPANY = 'SELECT_COMPANY';
export function selectCompany(id) {
    return function (dispatch) {
        dispatch(select(id));
        dispatch(fetchCompanyUsers(id));
    };
}

function select(id) {
    return {type: SELECT_COMPANY, id};
}

export const EDIT_COMPANY = 'EDIT_COMPANY';
export function editCompany(event) {
    return {type: EDIT_COMPANY, event};
}

export const NEW_COMPANY = 'NEW_COMPANY';
export function newCompany(data) {
    return {type: NEW_COMPANY, data};
}

export const CANCEL_EDIT = 'CANCEL_EDIT';
export function cancelEdit(event) {
    return {type: CANCEL_EDIT, event};
}

export const QUERY_COMPANIES = 'QUERY_COMPANIES';
export function queryCompanies() {
    return {type: QUERY_COMPANIES};
}

export const GET_COMPANIES = 'GET_COMPANIES';
export function getCompanies(data) {
    return {type: GET_COMPANIES, data};
}

export const GET_COMPANY_USERS = 'GET_COMPANY_USERS';
export function getCompanyUsers(data) {
    return {type: GET_COMPANY_USERS, data};
}

export const GET_PRODUCTS = 'GET_PRODUCTS';
export function getProducts(data) {
    return {type: GET_PRODUCTS, data};
}

export const SET_ERROR = 'SET_ERROR';
export function setError(errors) {
    return {type: SET_ERROR, errors};
}


/**
 * Fetches companies
 *
 */
export function fetchCompanies() {
    return function (dispatch, getState) {
        dispatch(queryCompanies());
        const query = searchQuerySelector(getState()) || '';

        return server.get(`/companies/search?q=${query}`)
            .then((data) => {
                dispatch(getCompanies(data));
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

/**
 * Fetches users of a company
 *
 * @param {String} companyId
 */
export function fetchCompanyUsers(companyId, force = false) {
    return function (dispatch, getState) {
        if (!force && !getState().companiesById[companyId].name) {
            return;
        }

        return server.get(`/companies/${companyId}/users`)
            .then((data) => {
                return dispatch(getCompanyUsers(data));
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}


/**
 * Creates new company
 *
 */
export function postCompany() {
    return function (dispatch, getState) {

        const company = getState().companyToEdit;
        const url = `/companies/${company._id ? company._id : 'new'}`;

        return server.post(url, company)
            .then(function() {
                if (company._id) {
                    notify.success(gettext('Company updated successfully'));
                } else {
                    notify.success(gettext('Company created successfully'));
                }
                dispatch(fetchCompanies());
            })
            .catch((error) => errorHandler(error, dispatch, setError));

    };
}
export function savePermissions(company, permissions) {
    return function (dispatch) {
        return server.postWithCsrfToken(`/companies/${company._id}/permissions`, permissions)
            .then(() => {
                notify.success(gettext('Company updated successfully'));
                dispatch(fetchProducts());
                dispatch(fetchCompanies());
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

/**
 * Fetches products
 *
 */
export function fetchProducts() {
    return function (dispatch) {
        return server.get('/products/search')
            .then((data) => {
                dispatch(getProducts(data));
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}


/**
 * Save permissions for a company
 *
 */
/**
 * Deletes a company
 *
 */
export function deleteCompany() {
    return function (dispatch, getState) {

        const company = getState().companyToEdit;
        const url = `/companies/${company._id}`;

        return server.del(url)
            .then(() => {
                notify.success(gettext('Company deleted successfully'));
                dispatch(fetchCompanies());
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

export const INIT_VIEW_DATA = 'INIT_VIEW_DATA';
export function initViewData(data) {
    return {type: INIT_VIEW_DATA, data};
}
