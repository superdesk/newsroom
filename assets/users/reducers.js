import {
    GET_USERS,
    GET_USER,
    SELECT_USER,
    EDIT_USER,
    QUERY_USERS,
    CANCEL_EDIT,
    NEW_USER,
    SET_ERROR,
    GET_COMPANIES,
    SET_COMPANY,
    SET_SORT,
    TOGGLE_SORT_DIRECTION,
} from './actions';

import {ADD_EDIT_USERS} from 'actions';

import {searchReducer} from 'search/reducers';

const initialState = {
    user: null,
    query: null,
    users: [],
    usersById: {},
    activeUserId: null,
    isLoading: false,
    totalUsers: null,
    activeQuery: null,
    companies: [],
    company: null,
    sort: null,
    sortDirection: 1,
    search: searchReducer(),
};

export default function userReducer(state = initialState, action) {
    switch (action.type) {

    case SELECT_USER: {
        const defaultUser = {
            user_type: 'public',
            is_approved: true,
            is_enabled: true,
            _id: null,
            name: '',
            email: '',
            phone: '',
            mobile: '',
            role: '',
            company: '',
        };

        return {
            ...state,
            activeUserId: action.id || null,
            userToEdit: action.id ? Object.assign(defaultUser, state.usersById[action.id]) : null,
            errors: null,
        };
    }

    case GET_USER: {
        return {
            ...state,
            user: action.user,
        };
    }

    case EDIT_USER: {
        const target = action.event.target;
        const field = target.name;
        let user = state.userToEdit;
        user[field] = target.type === 'checkbox' ? target.checked : target.value;
        return {...state, userToEdit: user, errors: null};
    }

    case NEW_USER: {
        const newUser =  {
            user_type: 'public',
            is_approved: true,
            is_enabled: true,
            _id: null,
            name: '',
            email: '',
            phone: '',
            company: '',
        };

        return {...state, userToEdit: newUser, errors: null};
    }

    case CANCEL_EDIT: {
        return {...state, userToEdit: null, errors: null};
    }

    case SET_ERROR:
        return {...state, errors: action.errors};

    case QUERY_USERS:
        return {...state,
            isLoading: true,
            totalUsers: null,
            userToEdit: null,
            activeQuery: state.query};

    case GET_USERS: {
        const usersById = Object.assign({}, state.usersById);
        const users = action.data.map((user) => {
            usersById[user._id] = user;
            return user._id;
        });

        return {
            ...state,
            users,
            usersById,
            isLoading: false,
            totalUsers: users.length,
        };
    }

    case GET_COMPANIES: {
        const companiesById = {};
        action.data.map((company) => companiesById[company._id] = company);

        return {...state, companies: action.data, companiesById};

    }

    case SET_COMPANY: {
        return {...state, company: action.company};
    }

    case SET_SORT: {
        return {
            ...state,
            sort: action.param,
            sortDirection: 1
        };
    }

    case TOGGLE_SORT_DIRECTION: {
        return {...state, sortDirection: state.sortDirection === 1 ? -1 : 1};
    }

    case ADD_EDIT_USERS: {
        return {
            ...state,
            editUsers: [
                ...(state.editUsers || []),
                ...action.data,
            ]
        };
    }

    default: {
        const search = searchReducer(state.search, action);

        if (search !== state.search) {
            return {...state, search};
        }

        return state;
    }
    }
}
