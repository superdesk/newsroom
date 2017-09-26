
import {
    PREVIEW_ITEM,
    SET_ITEMS,
    SET_QUERY,
    QUERY_ITEMS,
    RECIEVE_ITEMS,
    SET_STATE,
    SET_ACTIVE,
    RENDER_MODAL,
    CLOSE_MODAL,
    INIT_DATA,
    ADD_TOPIC,
} from './actions';

const initialState = {
    items: [],
    itemsById: {},
    activeItem: null,
    previewItem: null,
    isLoading: false,
    totalItems: null,
    activeQuery: null,
    user: null,
    topics: [],
};

export default function wireReducer(state = initialState, action) {
    switch (action.type) {

    case SET_ITEMS: {
        const itemsById = {};
        const items = [];

        action.items.forEach((item) => {
            if (!itemsById[item._id]) {
                itemsById[item._id] = item;
                items.push(item._id);
            }
        });

        return {
            ...state,
            itemsById,
            items,
        };
    }

    case SET_ACTIVE:
        return {
            ...state,
            activeItem: action.item || null,
        };

    case PREVIEW_ITEM:
        return {
            ...state,
            previewItem: action.item || null,
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

    case RENDER_MODAL:
        return {...state, modal: {modal: action.modal, data: action.data}};

    case CLOSE_MODAL:
        return {...state, modal: null};

    case INIT_DATA:
        return {
            ...state,
            user: action.data.user || null,
            topics: action.data.topics || [],
        };

    case ADD_TOPIC:
        return {
            ...state,
            topics: state.topics.concat([action.topic]),
        };

    default:
        return state;
    }
}
