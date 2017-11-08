import {
    PREVIEW_ITEM,
    OPEN_ITEM,
    SET_ITEMS,
    SET_QUERY,
    QUERY_ITEMS,
    RECIEVE_ITEMS,
    RECIEVE_ITEM,
    REMOVE_NEW_ITEMS_BY_TOPIC,
    CLEAR_ALL_NEW_ITEMS,
    CLEAR_NEW_ITEM,
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
    TOGGLE_SERVICE,
    TOGGLE_FILTER,
    START_LOADING,
    RECIEVE_NEXT_ITEMS,
    SET_CREATED_FILTER,
    RESET_FILTER,
} from './actions';

import { toggleValue } from 'utils';
import { get } from 'lodash';

const initialState = {
    items: [],
    itemsById: {},
    aggregations: null,
    activeItem: null,
    previewItem: null,
    openItem: null,
    isLoading: false,
    totalItems: null,
    activeQuery: null,
    user: null,
    company: null,
    topics: [],
    selectedItems: [],
    bookmarks: false,
    formats: [],
    newItems: [],
    newItemsByTopic: {},
    wire: {
        services: [],
        activeService: {},
        activeFilter: {},
        createdFilter: {},
    },
};

function recieveItems(state, data) {
    const itemsById = {};
    const items = data._items.map((item) => {
        itemsById[item._id] = item;
        return item._id;
    });

    return {
        ...state,
        items,
        itemsById,
        isLoading: false,
        totalItems: data._meta.total,
        aggregations: data._aggregations || null,
    };
}

function _wireReducer(state, action) {
    switch (action.type) {
    case TOGGLE_SERVICE: {
        let activeService = Object.assign({}, state.activeService);
        if (action.service) {
            activeService[action.service.code] = !activeService[action.service.code];
        } else { // toggle all off
            activeService = {};
        }
        return {
            ...state,
            activeFilter: {},
            activeService,
        };
    }

    case TOGGLE_FILTER: {
        const activeFilter = Object.assign({}, state.activeFilter);
        activeFilter[action.key] = toggleValue(activeFilter[action.key], action.val);
        if (action.single) {
            activeFilter[action.key] = activeFilter[action.key].filter((val) => val === action.val);
        }
        return {
            ...state,
            activeFilter: activeFilter,
        };
    }

    case SET_CREATED_FILTER: {
        const createdFilter = Object.assign({}, state.createdFilter, action.filter);
        return {
            ...state,
            createdFilter,
        };
    }

    case RESET_FILTER:
        return {
            ...state,
            activeFilter: {},
            createdFilter: {},
        };

    default:
        return state;
    }
}

function _modalReducer(state, action) {
    switch (action.type) {
    case RENDER_MODAL:
        return {modal: action.modal, data: action.data};

    case CLOSE_MODAL:
        return null;

    default:
        return state;
    }
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

    case OPEN_ITEM:
        return {
            ...state,
            openItem: action.item || null,
        };

    case SET_QUERY:
        return {...state, query: action.query};

    case QUERY_ITEMS:
        return {...state, isLoading: true, totalItems: null, activeQuery: state.query};

    case RECIEVE_ITEMS:
        return recieveItems(state, action.data);

    case RECIEVE_ITEM: {
        const itemsById = Object.assign({}, state.itemsById);
        itemsById[action.data._id] = action.data;
        return  {...state, itemsById};
    }

    case RECIEVE_NEXT_ITEMS: {
        const itemsById = Object.assign({}, state.itemsById);
        const items = state.items.concat(action.data._items.map((item) => {
            if (itemsById[item._id]) {
                return;
            }

            itemsById[item._id] = item;
            return item._id;
        }).filter((_id) => _id));
        return {...state, items, itemsById, isLoading: false};
    }

    case SET_STATE:
        return Object.assign({}, action.state || initialState);

    case RENDER_MODAL:
    case CLOSE_MODAL:
        return {...state, modal: _modalReducer(state.modal, action)};

    case INIT_DATA:
        return {
            ...state,
            user: action.data.user || null,
            topics: action.data.topics || [],
            company: action.data.company || null,
            bookmarks: action.data.bookmarks || false,
            formats: action.data.formats || [],
            wire: Object.assign(state.wire, {services: action.data.services}),
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

    case SET_NEW_ITEMS: {
        const newItemsByTopic = state.newItemsByTopic || {};
        action.data.topics.map((topic) => {
            newItemsByTopic[topic] = newItemsByTopic[topic] || [];
            newItemsByTopic[topic].push(action.data.item);
        });

        const newItems = state.newItems ?
            state.newItems.slice(0, state.newItems.length) : [];
        newItems.push(action.data.item);

        let itemsById = state.itemsById;
        if (get(action.data, 'item._id') && state.itemsById[action.data.item._id]) {
            itemsById = Object.assign({}, itemsById);
            itemsById[action.data.item._id] = action.data.item;
        }

        return {
            ...state,
            newItems,
            newItemsByTopic,
            itemsById,
        };
    }


    case REMOVE_NEW_ITEMS_BY_TOPIC: {
        const newItemsByTopic = Object.assign({}, state.newItemsByTopic);
        let newItems = state.newItems || [];

        if (state.newItemsByTopic[action.data]) {

            newItemsByTopic[action.data].map((item) => {
                newItems = newItems.filter((newItem) => newItem._id !== item._id);
            });
        }

        newItemsByTopic[action.data] = null;

        return {
            ...state,
            newItems,
            newItemsByTopic
        };
    }


    case CLEAR_ALL_NEW_ITEMS:
        return {
            ...state,
            newItems:[],
            newItemsByTopic:{}
        };


    case CLEAR_NEW_ITEM: {

        const newItems = state.newItems.filter((newItem) => newItem._id !== action.id);

        const newItemsByTopic = Object.assign({}, state.newItemsByTopic);

        for (const key in newItemsByTopic) {
            newItemsByTopic[key] = newItemsByTopic[key].filter((newItem) => newItem._id !== action.id);
        }

        return {
            ...state,
            newItems,
            newItemsByTopic,
        };
    }

    case TOGGLE_SERVICE:
    case TOGGLE_FILTER:
    case SET_CREATED_FILTER:
    case RESET_FILTER:
        return {...state, wire: _wireReducer(state.wire, action)};

    case START_LOADING:
        return {...state, isLoading: true};

    default:
        return state;
    }
}
