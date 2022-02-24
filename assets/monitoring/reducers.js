
import {
    SET_COMPANIES,
    NEW_MONITORING_PROFILE,
    CANCEL_EDIT,
    UPDATE_MONITORING_PROFILE,
    SET_ERROR,
    SET_COMPANY,
    SET_MONITORING_LIST,
    QUERY_MONITORING,
    SELECT_MONITORING_PROFILE,
    SET_MONITORING_COMPANIES,
    SET_SCHEDULE_MODE,
    SET_USER_COMPANY_MONITORING_LIST,
} from './actions';

import {GET_COMPANY_USERS} from 'companies/actions';
import {ADD_EDIT_USERS} from 'actions';

const initialState = {
    companies: [],
    monitoringList: [],
    monitoringListById: null,
    isLoading: false,
    monitoringListCompanies: [],
};

export default function monitoringReducer(state = initialState, action) {
    switch (action.type) {

    case SELECT_MONITORING_PROFILE:
        return {
            ...state,
            activeMonitoringProfileId: action.id || null,
            monitoringProfileToEdit: action.id ? (state.monitoringListById[action.id]) : {},
            errors: null,
        };

    case SET_COMPANIES: {
        const companiesById = {};
        action.data.map((company) => companiesById[company._id] = company);
        return {...state, companies: action.data, companiesById};

    }

    case NEW_MONITORING_PROFILE: {
        return {
            ...state,
            monitoringProfileToEdit: {
                name: '',
                subject: '',
                description: '',
                email: '',
                alert_type: 'full_text',
                format_type: 'monitoring_pdf',
                company: '',
                is_enabled: true,
                query: '',
                keywords: [],
                always_send: false,
            },
            errors: null};
    }

    case CANCEL_EDIT: {
        return {...state, monitoringProfileToEdit: null, errors: null};
    }

    case UPDATE_MONITORING_PROFILE: {
        return {
            ...state,
            monitoringProfileToEdit: {
                ...state.monitoringProfileToEdit,
                ...action.data,
            },
            errors: null,
        };
    }

    case SET_ERROR:
        return {...state, errors: action.errors};

    case SET_COMPANY: {
        return {...state, company: action.company};
    }

    case SET_MONITORING_LIST: {
        let monitoringListById = Object.assign({}, state.monitoringListById);
        const profiles = action.data.map((p) => {
            monitoringListById[p._id] = p;
            return p._id;
        });

        return {
            ...state,
            monitoringList: profiles,
            monitoringListById,
            isLoading: false,
            totalProfiles: profiles.length,
        };
    }

    case QUERY_MONITORING:
        return {
            ...state,
            isLoading: true,
            totalUsers: null,
            userToEdit: null,
            activeQuery: state.query
        };

    case GET_COMPANY_USERS:
        return {...state, monitoringUsers: action.data};

    case SET_MONITORING_COMPANIES:
        return {
            ...state,
            monitoringListCompanies: action.data,
        };

    case SET_SCHEDULE_MODE:
        return {
            ...state,
            scheduleMode: !state.scheduleMode,
        };

    case SET_USER_COMPANY_MONITORING_LIST: 
        return {...state, monitoringList: action.data};     

    case ADD_EDIT_USERS: {
        return {
            ...state,
            editUsers: [
                ...(state.editUsers || []),
                ...action.data,
            ]
        };
    }

    default:
        return state;
    }
}
