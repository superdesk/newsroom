import {errorHandler} from '../utils';
import {REPORTS_NAMES} from './utils';
import server from '../server';


const REPORTS = {
    [REPORTS_NAMES.COMPANY_SAVED_SEARCHES]: '/reports/company-saved-searches',
    [REPORTS_NAMES.USER_SAVED_SEARCHES]: '/reports/user-saved-searches',
    [REPORTS_NAMES.COMPANY_PRODUCTS]: '/reports/company-products',
    [REPORTS_NAMES.PRODUCT_STORIES]: '/reports/product-stories',
    [REPORTS_NAMES.COMPANY]: '/reports/company',
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