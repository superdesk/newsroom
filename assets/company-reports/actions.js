import {errorHandler, getItemFromArray, getDateInputDate, notify, gettext} from '../utils';
import {REPORTS_NAMES} from './utils';
import server from '../server';
import {get, cloneDeep} from 'lodash';


export const REPORTS = {
    [REPORTS_NAMES.COMPANY_SAVED_SEARCHES]: '/reports/company-saved-searches',
    [REPORTS_NAMES.USER_SAVED_SEARCHES]: '/reports/user-saved-searches',
    [REPORTS_NAMES.COMPANY_PRODUCTS]: '/reports/company-products',
    [REPORTS_NAMES.PRODUCT_STORIES]: '/reports/product-stories',
    [REPORTS_NAMES.COMPANY]: '/reports/company',
    [REPORTS_NAMES.SUBSCRIBER_ACTIVITY]: '/reports/subscriber-activity',

};

function getReportQueryString(currentState, next, exportReport, notify) {
    let params = cloneDeep(currentState.reportParams);
    if (params) {
        if (params.company) {
            params.company = get(getItemFromArray(params.company, currentState.companies, 'name'), '_id');
        }

        if (params.date_from > params.date_to) {
            notify.error(gettext('To date is after From date'));
        }

        if (params.date_from) {
            params.date_from = getDateInputDate(params.date_from);
        }

        if (params.date_to) {
            params.date_to = getDateInputDate(params.date_to);
        }

        if (params.section) {
            params.section = get(getItemFromArray(params.section, currentState.sections, 'name'), '_id');
        }

        if (exportReport) {
            params.export = true;
        }

        params['from'] = next ? get(currentState, 'results.length') : 0;
        const queryString = Object.keys(params)
            .filter((key) => params[key])
            .map((key) => [key, params[key]].join('='))
            .join('&');
        return queryString;
    }
}

export const INIT_DATA = 'INIT_DATA';
export function initData(data) {
    return {type: INIT_DATA, data};
}

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

export const ADD_RESULTS = 'ADD_RESULTS';
export function addResults(results) {
    return {type: ADD_RESULTS, data: results};
}

export const SET_ERROR = 'SET_ERROR';
export function setError(errors) {
    return {type: SET_ERROR, errors};
}

export const SET_IS_LOADING = 'SET_IS_LOADING';
export function isLoading(data = false) {
    return {type: SET_IS_LOADING, data};
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
export function fetchReport(url, next, exportReport) {
    return function (dispatch, getState) {
        if (next) {
            dispatch(isLoading(next));
        }

        let queryString = getReportQueryString(getState(), next, exportReport, notify);
        let apiRequest;

        if (exportReport) {
            if (getState().results.length <= 0) {
                notify.error(gettext('No data to export.'));
                return;
            }

            window.open(`/reports/export/${getState().activeReport}?${queryString}`, '_blank');
            return;
        }

        if (queryString) {
            apiRequest = server.get(`${url}?${queryString}`);
        } else {
            apiRequest = server.get(url);
        }

        return apiRequest.then((data) => {
            if (!next) {
                dispatch(receivedData(data));
            } else {
                dispatch(isLoading(false));
                dispatch(addResults(get(data, 'results', [])));
            }
        })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

export const TOGGLE_REPORT_FILTER = 'TOGGLE_REPORT_FILTER';
export function toggleFilterAndQuery(filter, value) {
    return function (dispatch) {
        dispatch({
            type: TOGGLE_REPORT_FILTER,
            data: {
                filter,
                value
            }
        });

        return dispatch(runReport());
    };
}
