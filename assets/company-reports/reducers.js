
import {
    SET_ERROR,
    RECEIVED_DATA,
    QUERY_REPORT,
    SET_ACTIVE_REPORT,
} from './actions';

const initialState = {
    isLoading: false,
    activeReport: null,
    activeReportData: {},
};


export default function companyReportReducer(state = initialState, action) {
    switch (action.type) {

    case QUERY_REPORT: {
        return {
            ...state,
            activeReportData: {},
            isLoading: true,
        };
    }

    case SET_ACTIVE_REPORT: {
        return {
            ...state,
            activeReport: action.data.target.value,
            activeReportData: {},
        };
    }

    case RECEIVED_DATA: {
        return {
            ...state,
            activeReportData: action.data,
            isLoading: false,
        };
    }

    case SET_ERROR:
        return {...state, errors: action.errors, isLoading: false};


    default:
        return state;
    }
}
