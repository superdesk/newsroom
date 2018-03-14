import {errorHandler} from '../utils';
import server from '../server';


const REPORTS = {
    'company-saved-searches': '/reports/company-saved-searches',
    'user-saved-searches': '/reports/user-saved-searches',
    'company-products': '/reports/company-products',
    'product-stories': '/reports/product-stories',
};


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
        dispatch(fetchReport(REPORTS[getState().activeReport]));
    };
}

/**
 * Fetches the report data
 *
 */
export function fetchReport(url) {
    return function (dispatch) {
        return server.get(url)
            .then((data) => {
                dispatch(receivedData(data));
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}