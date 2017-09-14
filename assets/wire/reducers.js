
import {
    PREVIEW_ITEM,
    SET_ITEMS,
    SET_QUERY,
} from './actions';

const initialState = {
    items: [],
    itemsById: {},
    activeItem: null,
    previewItem: null,
    query: null,
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
    default:
        return state;
    }
}
