
import {
    GET_ITEMS,
    SELECT_ITEM,
    EDIT_ITEM,
    QUERY_ITEMS,
    SET_QUERY,
    GET_COMPANIES,
    SAVE_ITEM,
    CANCEL_EDIT,
    SAVE_ERROR, NEW_ITEM
} from './actions';

const initialState = {
    query: null,
    items: [],
    itemsById: {},
    activeItemId: null,
    isLoading: false,
    totalItems: null,
    activeQuery: null,
};

export default function itemReducer(state = initialState, action) {
    switch (action.type) {

    case SELECT_ITEM:
        return {
            ...state,
            activeItemId: action.id || null,
            itemToEdit: action.id ? state.itemsById[action.id] : null,
            errors: null,
        };

    case EDIT_ITEM: {
        const target = action.event.target;
        const field = target.name;
        let item = state.itemToEdit;
        item[field] = target.type === 'checkbox' ? target.checked : target.value;
        return {...state, itemToEdit: item, errors: null};
    }

    case NEW_ITEM: {
        const newUser = {
            user_type: 'public',
            is_approved: true,
            is_enabled: true,
            _id: null,
            name: '',
            email: '',
            phone: '',
            company: '',
        };
        return {...state, itemToEdit: newUser, errors: null};
    }

    case SAVE_ITEM: {
        return {...state, itemToEdit: state.itemToEdit, errors: null};
    }

    case SAVE_ERROR: {
        return {...state, errors: action.data};
    }

    case CANCEL_EDIT: {
        return {...state, itemToEdit: null};
    }

    case SET_QUERY:
        return {...state, query: action.query};

    case QUERY_ITEMS:
        return {...state,
            isLoading: true,
            totalItems: null,
            itemToEdit: null,
            activeQuery: state.query};

    case GET_ITEMS: {
        const itemsById = Object.assign({}, state.itemsById);
        const items = action.data.map((item) => {
            itemsById[item._id] = item;
            return item._id;
        });

        return {...state, items, itemsById, isLoading: false, totalItems: items.length};
    }

    case GET_COMPANIES: {
        const companiesById = {};
        const companyOptions = [];
        const companies = action.data.map((company) => {
            companiesById[company._id] = company;
            companyOptions.push({value: company._id, text: company.name});
            return company._id;
        });

        return {...state, companies, companiesById, companyOptions};
    }

    default:
        return state;
    }
}
