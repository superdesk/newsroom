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
    TOGGLE_SELECTED,
    SELECT_ALL,
    SELECT_NONE,
    BOOKMARK_ITEMS,
    REMOVE_BOOKMARK,
    SET_NEW_ITEMS,
    REFRESH_ITEMS,
} from './actions';

import { toggleValue } from 'utils';

const initialState = {
    items: [],
    itemsById: {},
    activeItem: null,
    previewItem: null,
    isLoading: false,
    totalItems: null,
    activeQuery: null,
    user: null,
    company: null,
    topics: [],
    selectedItems: [],
    bookmarks: false,
    formats: [],
    newItemsCount: 0,
    newItemsData: null,
};

function recieveItems(state, data) {
    const itemsById = Object.assign({}, state.itemsById);
    const items = data._items.map((item) => {
        itemsById[item._id] = item;
        return item._id;
    });

    return {...state, items, itemsById, isLoading: false, totalItems: data._meta.total};
}

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

    case RECIEVE_ITEMS:
        return recieveItems(state, action.data);

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
            company: action.data.company || null,
            bookmarks: action.data.bookmarks || false,
            formats: action.data.formats || [],
        };

    case ADD_TOPIC:
        return {
            ...state,
            topics: state.topics.concat([action.topic]),
        };

    case TOGGLE_SELECTED:
        return {
            ...state,
            selectedItems: toggleValue(state.selectedItems, action.item),
        };

    case SELECT_ALL:
        return {
            ...state,
            selectedItems: state.items.concat(),
        };

    case SELECT_NONE:
        return {
            ...state,
            selectedItems: [],
        };

    case BOOKMARK_ITEMS: {
        const missing = action.items.filter((item) => state.bookmarkedItems.indexOf(item) === -1);
        return {
            ...state,
            bookmarkedItems: state.bookmarkedItems.concat(missing),
        };
    }

    case REMOVE_BOOKMARK:
        return {
            ...state,
            bookmarkedItems: state.bookmarkedItems.filter((val) => val !== action.item),
        };

    case SET_NEW_ITEMS:
        return {
            ...state,
            newItemsCount: action.newItems.length,
            newItemsData: action.newItems.length ? action.data : null,
        };

    case REFRESH_ITEMS: {
        const nextState = recieveItems(state, state.newItemsData);
        return Object.assign(nextState, {
            newItemsCount: 0,
            newItemsData: null,
        });
    }

    default:
        return state;
    }
}
