import {
    GET_PRODUCTS,
    SELECT_PRODUCT,
    EDIT_PRODUCT,
    QUERY_PRODUCTS,
    CANCEL_EDIT,
    NEW_PRODUCT,
    SET_ERROR,
    GET_COMPANIES,
    GET_NAVIGATIONS,
    UPDATE_PRODUCT_COMPANIES,
    UPDATE_PRODUCT_NAVIGATIONS,
} from './actions';
import {ADD_EDIT_USERS} from 'actions';

import {INIT_SECTIONS, SELECT_SECTION} from 'features/sections/actions';
import {sectionsReducer} from 'features/sections/reducers';
import {searchReducer} from 'search/reducers';

const initialState = {
    query: null,
    products: [],
    productsById: {},
    activeProductId: null,
    isLoading: false,
    totalProducts: null,
    activeQuery: null,
    companies: [],
    navigations: [],
    sections: sectionsReducer(),
    search: searchReducer(),
};

export default function productReducer(state = initialState, action) {
    switch (action.type) {

    case SELECT_PRODUCT: {
        const defaultProduct = {
            is_enabled: true,
            name: '',
            description: '',
        };

        return {
            ...state,
            activeProductId: action.id || null,
            productToEdit: action.id ? Object.assign(defaultProduct, state.productsById[action.id]) : null,
            errors: null,
        };
    }

    case EDIT_PRODUCT: {
        const target = action.event.target;
        const field = target.name;
        let product = state.productToEdit;
        product[field] = target.type === 'checkbox' ? target.checked : target.value;
        return {...state, productToEdit: product, errors: null};
    }

    case NEW_PRODUCT: {
        const productToEdit = {
            is_enabled: true,
            name: '',
            description: '',
            product_type: state.sections.active,
        };

        return {...state, productToEdit, errors: null};
    }

    case CANCEL_EDIT: {
        return {...state, productToEdit: null, errors: null};
    }

    case SET_ERROR:
        return {...state, errors: action.errors};

    case QUERY_PRODUCTS:
        return {...state,
            isLoading: true,
            totalProducts: null,
            productToEdit: null,
            activeQuery: state.query};

    case GET_PRODUCTS: {
        const productsById = Object.assign({}, state.productsById);
        const products = action.data.map((product) => {
            productsById[product._id] = product;
            return product._id;
        });

        return {
            ...state,
            products,
            productsById,
            isLoading: false,
            totalProducts: products.length,
        };
    }

    case GET_COMPANIES: {
        const companiesById = {};
        action.data.map((company) => companiesById[company._id] = company);

        return {...state, companies: action.data, companiesById};
    }

    case GET_NAVIGATIONS: {
        const navigationsById = {};
        action.data.map((navigation) => navigationsById[navigation._id] = navigation);

        return {...state, navigations: action.data, navigationsById};
    }

    case UPDATE_PRODUCT_COMPANIES: {
        const product = Object.assign({}, action.product, {companies: action.companies});
        const productsById = Object.assign({}, state.productsById);
        productsById[action.product._id] = product;

        return {...state, productsById, productToEdit: product};
    }

    case UPDATE_PRODUCT_NAVIGATIONS: {
        const product = Object.assign({}, action.product, {navigations: action.navigations});
        const productsById = Object.assign({}, state.productsById);
        productsById[action.product._id] = product;

        return {...state, productsById, productToEdit: product};
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
