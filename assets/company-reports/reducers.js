import {get} from 'lodash';

import { getTimezoneOffset } from 'utils';
import {
    SET_ERROR,
    RECEIVED_DATA,
    QUERY_REPORT,
    SET_ACTIVE_REPORT,
    INIT_DATA,
    TOGGLE_REPORT_FILTER,
    ADD_RESULTS,
    SET_IS_LOADING,
    GET_PRODUCTS,
} from './actions';

const initialState = {
    isLoading: false,
    activeReport: null,
    results: [],
    resultHeaders: [],
    aggregations: null,
    companies: [],
    sections: [],
    products: [],
    reportParams: {
        date_from: Date.now(),
        date_to: Date.now(),
        timezone_offset: getTimezoneOffset(),
        company: null,
        action: null,
        section: null,
        product: null,
    }
};


export default function companyReportReducer(state = initialState, action) {
    switch (action.type) {

    case INIT_DATA:
        return {
            ...state,
            companies: action.data.companies,
            sections: action.data.sections,
            apiEnabled: action.data.api_enabled || false,
            products: action.data.products,
        };

    case QUERY_REPORT: {
        return {
            ...state,
            results: [],
            isLoading: true,
        };
    }

    case SET_ACTIVE_REPORT: {
        return {
            ...state,
            activeReport: action.data,
            results: [],
        };
    }

    case RECEIVED_DATA: {
        return {
            ...state,
            results: get(action, 'data.results'),
            isLoading: false,
            aggregations: get(action, 'data.aggregations', null),
            resultHeaders: get(action, 'data.result_headers', []),
        };
    }

    case SET_ERROR:
        return {...state, errors: action.errors, isLoading: false};

    case TOGGLE_REPORT_FILTER:
        return {
            ...state,
            reportParams: {
                ...state.reportParams,
                [action.data.filter]: action.data.value
            }
        };

    case ADD_RESULTS:
        return {
            ...state,
            results: [ ...state.results, ...action.data ]
        };

    case SET_IS_LOADING:
        return {
            ...state,
            isLoading: action.data
        };

    case GET_PRODUCTS:
        return {...state, products: action.data};        

    case 'RECEIVE_REPORT_AGGREGATIONS':
        return {
            ...state,
            reportAggregations: action.data,
        };

    default:
        return state;
    }
}
