import {errorHandler, getItemFromArray, getDateInputDate, notify, gettext} from '../utils';
import server from '../server';
import {get, cloneDeep} from 'lodash';

export const REPORTS_NAMES = {
    'COMPANY_SAVED_SEARCHES': 'company-saved-searches',
    'USER_SAVED_SEARCHES': 'user-saved-searches',
    'COMPANY_PRODUCTS': 'company-products',
    'PRODUCT_STORIES': 'product-stories',
    'COMPANY': 'company',
    'SUBSCRIBER_ACTIVITY': 'subscriber-activity',
    'CONTENT_ACTIVITY': 'content-activity',
    'COMPANY_NEWS_API_USAGE': 'company-news-api-usage',
    'PRODUCT_COMPANIES': 'product-companies',
    'EXPIRED_COMPANIES': 'expired-companies',
};


export const REPORTS = {
    [REPORTS_NAMES.COMPANY_SAVED_SEARCHES]: '/reports/company-saved-searches',
    [REPORTS_NAMES.USER_SAVED_SEARCHES]: '/reports/user-saved-searches',
    [REPORTS_NAMES.COMPANY_PRODUCTS]: '/reports/company-products',
    [REPORTS_NAMES.PRODUCT_STORIES]: '/reports/product-stories',
    [REPORTS_NAMES.COMPANY]: '/reports/company',
    [REPORTS_NAMES.SUBSCRIBER_ACTIVITY]: '/reports/subscriber-activity',
    [REPORTS_NAMES.CONTENT_ACTIVITY]: '/reports/content-activity',
    [REPORTS_NAMES.COMPANY_NEWS_API_USAGE]: '/reports/company-news-api-usage',
    [REPORTS_NAMES.PRODUCT_COMPANIES]: '/reports/product-companies',
    [REPORTS_NAMES.EXPIRED_COMPANIES]: '/reports/expired-companies',
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

        if (params.product) {
            params.product = get(getItemFromArray(params.product, currentState.products, 'name'), '_id');
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
    return function (dispatch) {
        dispatch(fetchProducts());
        dispatch({type: INIT_DATA, data});
    };
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

export const GET_PRODUCTS = 'GET_PRODUCTS';
export function getProducts(data) {
    return {type: GET_PRODUCTS, data};
}

export function runReport() {
    return function (dispatch, getState) {
        dispatch(queryReport());
        dispatch(fetchReport(REPORTS[getState().activeReport]));
    };
}

export function fetchAggregations(url) {
    return function(dispatch, getState) {
        let queryString = getReportQueryString(getState(), 0, false, notify);

        server.get(`${url}?${queryString}&aggregations=1`)
            .then((data) => {
                dispatch({
                    type: 'RECEIVE_REPORT_AGGREGATIONS',
                    data: data,
                });
            });
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
export function toggleFilter(filter, value) {
    return {
        type: TOGGLE_REPORT_FILTER,
        data: {
            filter,
            value
        }
    };
}

export function toggleFilterAndQuery(filter, value) {
    return function (dispatch) {
        dispatch(toggleFilter(filter, value));
        return dispatch(runReport());
    };
}

export function printReport() {
    return function (dispatch, getState) {
        const state = getState();
        const activeReport = state.activeReport;

        if (activeReport === REPORTS_NAMES.SUBSCRIBER_ACTIVITY) {
            const queryString = getReportQueryString(state, false, false, notify);
            window.open(`/reports/print/${activeReport}?${queryString}`, '_blank');
        } else {
            window.open(`/reports/print/${activeReport}`, '_blank');
        }

        return Promise.resolve();
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
