import {errorHandler} from '../utils';
import server from '../server';


export const QUERY_REPORT = 'QUERY_REPORT';
export function queryReport() {
    return {type: QUERY_REPORT};
}

export const SET_ACTIVE_REPORT = 'SET_ACTIVE_REPORT';
export function setActiveReport(data) {
    return {type: SET_ACTIVE_REPORT, data};
}

export const RECEIVED_DATA = 'RECEIVED_DATA';
export function receivedData(data) {
    return {type: RECEIVED_DATA, data};
}

export const SET_ERROR = 'SET_ERROR';
export function setError(errors) {
    return {type: SET_ERROR, errors};
}

export function runReport() {
    return function (dispatch, getState) {
        dispatch(queryReport());
        if (getState().activeReport == 'company-saved-searches') {
            dispatch(fetchCompanySavedSearches());
        }

        if (getState().activeReport == 'user-saved-searches') {
            dispatch(fetchUserSavedSearches());
        }

        if (getState().activeReport == 'company-products') {
            dispatch(fetchCompanyProducts());
        }
    };
}

/**
 * Fetches number of saved searches by company
 *
 */
export function fetchCompanySavedSearches() {
    return function (dispatch) {
        return server.get('/reports/company/saved_searches')
            .then((data) => {
                dispatch(receivedData(data));
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

/**
 * Fetches number of saved searches by company
 *
 */
export function fetchUserSavedSearches() {
    return function (dispatch) {
        return server.get('/reports/user/saved_searches')
            .then((data) => {
                dispatch(receivedData(data));
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

/**
 * Fetches company products
 *
 */
export function fetchCompanyProducts() {
    return function (dispatch) {
        return server.get('/reports/company/products')
            .then((data) => {
                dispatch(receivedData(data));
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}