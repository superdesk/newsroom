import {startsWith, set} from 'lodash';
import {
    GET_NAVIGATIONS,
    SELECT_NAVIGATION,
    EDIT_NAVIGATION,
    QUERY_NAVIGATIONS,
    CANCEL_EDIT,
    NEW_NAVIGATION,
    SET_ERROR,
    GET_PRODUCTS,
} from './actions';

import {
    INIT_SECTIONS,
    SELECT_SECTION,
} from 'features/sections/actions';

import {sectionsReducer} from 'features/sections/reducers';
import {searchReducer} from 'search/reducers';
import {ADD_EDIT_USERS} from 'actions';

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
    search: searchReducer(),
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
        if (startsWith(field, 'tile_images_file')) {
            const fileData = field.split('_');
            const fileIndex = parseInt(fileData[3], 10);
            set(navigation, `tile_images[${fileIndex}].file`, target.value);
        } else {
            navigation[field] = target.type === 'checkbox' ? target.checked : target.value;
        }

        return {...state, navigationToEdit: navigation, errors: null};
    }

    case NEW_NAVIGATION: {
        const navigationToEdit = {
            is_enabled: true,
            name: '',
            description: '',
            product_type: state.sections.active,
        };

        return {...state, navigationToEdit, errors: null};
    }

    case CANCEL_EDIT: {
        return {...state, navigationToEdit: null, errors: null};
    }

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

        return {
            ...state,
            navigations,
            navigationsById,
            isLoading: false,
            totalNavigations: navigations.length,
        };
    }

    case GET_PRODUCTS: {
        return {...state, products: action.data};
    }

    case INIT_SECTIONS:
    case SELECT_SECTION:
        return {...state, sections: sectionsReducer(state.sections, action)};

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
