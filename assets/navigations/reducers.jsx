
import {
    GET_NAVIGATIONS,
    SELECT_NAVIGATION,
    EDIT_NAVIGATION,
    QUERY_NAVIGATIONS,
    SET_QUERY,
    CANCEL_EDIT,
    NEW_NAVIGATION,
    SET_ERROR,
    GET_PRODUCTS,
} from './actions';

import {
    INIT_SECTIONS,
} from 'features/sections/actions';

import { sectionsReducer } from 'features/sections/reducers';

const initialState = {
    query: null,
    navigations: [],
    navigationsById: {},
    activeNavigationId: null,
    isLoading: false,
    totalNavigations: null,
    activeQuery: null,
    products: [],
    sections: sectionsReducer(),
};

export default function navigationReducer(state = initialState, action) {
    switch (action.type) {

    case SELECT_NAVIGATION: {
        const defaultNavigation = {
            is_enabled: true,
            name: '',
            description: '',
        };

        return {
            ...state,
            activeNavigationId: action.id || null,
            navigationToEdit: action.id ? Object.assign(defaultNavigation, state.navigationsById[action.id]) : null,
            errors: null,
        };
    }

    case EDIT_NAVIGATION: {
        const target = action.event.target;
        const field = target.name;
        let navigation = state.navigationToEdit;
        navigation[field] = target.type === 'checkbox' ? target.checked : target.value;
        return {...state, navigationToEdit: navigation, errors: null};
    }

    case NEW_NAVIGATION: {
        const navigationToEdit = {
            is_enabled: true,
            name: '',
            description: '',
        };

        return {...state, navigationToEdit, errors: null};
    }

    case CANCEL_EDIT: {
        return {...state, navigationToEdit: null, errors: null};
    }

    case SET_QUERY:
        return {...state, query: action.query};

    case SET_ERROR:
        return {...state, errors: action.errors};

    case QUERY_NAVIGATIONS:
        return {...state,
            isLoading: true,
            totalNavigations: null,
            navigationToEdit: null,
            activeQuery: state.query};

    case GET_NAVIGATIONS: {
        const navigationsById = Object.assign({}, state.navigationsById);
        const navigations = action.data.map((navigation) => {
            navigationsById[navigation._id] = navigation;
            return navigation._id;
        });

        return {...state, navigations, navigationsById, isLoading: false, totalNavigations: navigations.length};
    }

    case GET_PRODUCTS: {
        return {...state, products: action.data};
    }

    case INIT_SECTIONS:
        return {...state, sections: sectionsReducer(state.sections, action)};

    default:
        return state;
    }
}
