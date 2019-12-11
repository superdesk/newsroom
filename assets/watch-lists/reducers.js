
import {
    SET_COMPANIES,
    NEW_WATCH_LIST,
    CANCEL_EDIT,
    UPDATE_WATCH_LIST,
    SET_ERROR,
    SET_COMPANY,
    SET_WATCH_LISTS,
    QUERY_WATCH_LISTS,
    SELECT_WATCH_LIST,
    SET_WATCH_LIST_COMPANIES,
    SET_SCHEDULE_MODE,
    SET_USER_COMPANY_WATCH_LISTS,
} from './actions';

import {GET_COMPANY_USERS} from 'companies/actions';
import {ADD_EDIT_USERS} from 'actions';

const initialState = {
    companies: [],
    watchLists: [],
    watchListsById: null,
    isLoading: false,
    watchListCompanies: [],
};

export default function watchListsReducer(state = initialState, action) {
    switch (action.type) {

    case SELECT_WATCH_LIST:
        return {
            ...state,
            activeWatchListId: action.id || null,
            watchListToEdit: action.id ? (state.watchListsById[action.id]) : {},
            errors: null,
        };

    case SET_COMPANIES: {
        const companiesById = {};
        action.data.map((company) => companiesById[company._id] = company);
        return {...state, companies: action.data, companiesById};

    }

    case NEW_WATCH_LIST: {
        return {
            ...state,
            watchListToEdit: {
                name: '',
                subject: '',
                description: '',
                alert_type: 'full_text',
                company: '',
                is_enabled: true,
                query: '',
                keywords: [],
            },
            errors: null};
    }

    case CANCEL_EDIT: {
        return {...state, watchListToEdit: null, errors: null};
    }

    case UPDATE_WATCH_LIST: {
        return {
            ...state,
            watchListToEdit: {
                ...state.watchListToEdit,
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

    case SET_WATCH_LISTS: {
        const watchListsById = Object.assign({}, state.watchListsById);
        const watchLists = action.data.map((w) => {
            watchListsById[w._id] = w;
            return w._id;
        });

        return {
            ...state,
            watchLists,
            watchListsById,
            isLoading: false,
            totalWatchLists: watchLists.length,
        };
    }

    case QUERY_WATCH_LISTS:
        return {
            ...state,
            isLoading: true,
            totalUsers: null,
            userToEdit: null,
            activeQuery: state.query
        };

    case GET_COMPANY_USERS:
        return {...state, watchListUsers: action.data};

    case SET_WATCH_LIST_COMPANIES:
        return {
            ...state,
            watchListCompanies: action.data,
        };

    case SET_SCHEDULE_MODE:
        return {
            ...state,
            scheduleMode: !state.scheduleMode,
        };

    case SET_USER_COMPANY_WATCH_LISTS: 
        return {...state, watchLists: action.data};     

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
