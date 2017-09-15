
import {
    PREVIEW_ITEM,
    SET_ITEMS,
    SET_QUERY,
    QUERY_ITEMS,
    RECIEVE_ITEMS,
    SET_STATE,
} from './actions';

const initialState = {
    query: null,
    items: [],
    itemsById: {},
    activeItem: null,
    previewItem: null,
    isLoading: false,
    totalItems: null,
    activeQuery: null,
};

export default function wireReducer(state = initialState, action) {
    switch (action.type) {

    case SET_ITEMS: {
        const itemsById = {};

        action.items.forEach((item) => {
            itemsById[item._id] = item;
        });

        return {
            ...state,
            itemsById,
            items: action.items.map((item) => item._id)
        };
    }

    case PREVIEW_ITEM:
        return {
            ...state,
            activeItem: action.id || null,
            previewItem: action.id || null,
        };

    case SET_QUERY:
        return {...state, query: action.query};

    case QUERY_ITEMS:
        return {...state, isLoading: true, totalItems: null, activeQuery: state.query};

    case RECIEVE_ITEMS: {
        const itemsById = Object.assign({}, state.itemsById);
        const items = action.data._items.map((item) => {
            itemsById[item._id] = item;
            return item._id;
        });

        return {...state, items, itemsById, isLoading: false, totalItems: action.data._meta.total};
    }

    case SET_STATE:
        return Object.assign({}, action.state);

    default:
        return state;
    }
}
