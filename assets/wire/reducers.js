import {
    PREVIEW_ITEM,
    OPEN_ITEM,
    SET_ITEMS,
    SET_QUERY,
    QUERY_ITEMS,
    RECIEVE_ITEMS,
    RECIEVE_ITEM,
    REMOVE_NEW_ITEMS,
    SET_STATE,
    SET_ACTIVE,
    INIT_DATA,
    ADD_TOPIC,
    TOGGLE_SELECTED,
    SELECT_ALL,
    SELECT_NONE,
    SHARE_ITEMS,
    BOOKMARK_ITEMS,
    REMOVE_BOOKMARK,
    SET_NEW_ITEMS_BY_TOPIC,
    TOGGLE_NAVIGATION,
    TOGGLE_FILTER,
    START_LOADING,
    RECIEVE_NEXT_ITEMS,
    SET_CREATED_FILTER,
    RESET_FILTER,
    SET_VIEW,
    SET_NEW_ITEMS,
    DOWNLOAD_ITEMS,
    COPY_ITEMS,
    PRINT_ITEMS,
    SET_TOPICS,
    TOGGLE_NEWS,
} from './actions';

import { RENDER_MODAL, CLOSE_MODAL } from 'actions';
import { modalReducer } from 'reducers';

import { get } from 'lodash';
import { toggleValue } from 'utils';
import { EXTENDED_VIEW } from './defaults';
import { getMaxVersion } from './utils';

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
    companyName: '',
    topics: [],
    selectedItems: [],
    bookmarks: false,
    formats: [],
    newItems: [],
    newItemsData: null,
    newItemsByTopic: {},
    readItems: {},
    wire: {
        navigations: [],
        activeNavigation: null,
        activeFilter: {},
        createdFilter: {},
        activeView: EXTENDED_VIEW,
    },
    newsOnly: false,
};

function recieveItems(state, data) {
    const itemsById = Object.assign({}, state.itemsById);
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
        newItems: [],
        newItemsData: null,
    };
}

function getReadItems(state, item) {
    const readItems = Object.assign({}, state.readItems);

    if (item) {
        readItems[item._id] = getMaxVersion(readItems[item._id], item.version);
    }

    return readItems;
}

function updateItemActions(state, items, action) {
    const itemsById = Object.assign({}, state.itemsById);

    items.map((item) => {
        itemsById[item] = Object.assign({}, itemsById[item]);
        itemsById[item][action] = (itemsById[item][action] || []).concat([state.user]);
    });

    return itemsById;
}

function _wireReducer(state, action) {
    switch (action.type) {

    case TOGGLE_NAVIGATION: {
        const activeNavigation = action.navigation && action.navigation._id;

        return {
            ...state,
            activeFilter: {},
            createdFilter: {},
            activeNavigation,
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
            activeFilter: Object.assign({}, action.filter),
            createdFilter: {},
        };

    case SET_VIEW:
        return {
            ...state,
            activeView: action.view,
        };

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

    case TOGGLE_NEWS: {
        return {
            ...state,
            newsOnly: !state.newsOnly,
        };
    }


    case SET_ACTIVE:
        return {
            ...state,
            activeItem: action.item || null,
        };

    case PREVIEW_ITEM: {
        const readItems = getReadItems(state, action.item);

        return {
            ...state,
            readItems,
            previewItem: action.item ? action.item._id : null,
        };
    }

    case OPEN_ITEM:{
        const readItems = getReadItems(state, action.item);

        const itemsById = Object.assign({}, state.itemsById);
        if (action.item) {
            itemsById[action.item._id] = action.item;
        }

        return {
            ...state,
            readItems,
            itemsById,
            openItem: action.item || null,
        };
    }


    case SET_QUERY:
        return {...state, query: action.query, activeItem: null};

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
        return {...state, modal: modalReducer(state.modal, action)};

    case INIT_DATA: {
        const navigations = get(action, 'wireData.navigations', []);
        return {
            ...state,
            readItems: action.readData || {},
            newsOnly: action.newsOnly,
            user: action.wireData.user || null,
            topics: action.wireData.topics || [],
            company: action.wireData.company || null,
            companyName: action.wireData.companyName || '',
            bookmarks: action.wireData.bookmarks || false,
            formats: action.wireData.formats || [],
            wire: Object.assign(state.wire, {navigations}),
        };
    }

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

    case SHARE_ITEMS: {
        const itemsById = updateItemActions(state, action.items, 'shares');

        return {
            ...state,
            itemsById
        };
    }

    case DOWNLOAD_ITEMS: {
        const itemsById = updateItemActions(state, action.items, 'downloads');

        return {
            ...state,
            itemsById
        };
    }

    case COPY_ITEMS: {
        const itemsById = updateItemActions(state, action.items, 'copies');

        return {
            ...state,
            itemsById
        };
    }

    case PRINT_ITEMS: {
        const itemsById = updateItemActions(state, action.items, 'prints');

        return {
            ...state,
            itemsById
        };
    }

    case BOOKMARK_ITEMS: {
        const itemsById = Object.assign({}, state.itemsById);
        const bookmarkedItems = state.bookmarkedItems || [];

        const missing = action.items.filter((item) => {
            itemsById[item] = Object.assign({}, itemsById[item]);
            itemsById[item].bookmarks = (itemsById[item].bookmarks || []).concat([state.user]);
            return bookmarkedItems.indexOf(item) === -1;
        });

        return {
            ...state,
            itemsById,
            bookmarkedItems: bookmarkedItems.concat(missing),
        };
    }

    case REMOVE_BOOKMARK: {
        const itemsById = Object.assign({}, state.itemsById);
        const bookmarkedItems = state.bookmarkedItems || [];

        const bookmarks = action.items.filter((item) => {
            itemsById[item] = Object.assign({}, itemsById[item]);
            itemsById[item].bookmarks = (itemsById[item].bookmarks || []).filter((val) => val !== state.user);
            return bookmarkedItems.indexOf(item) === -1;
        });

        return {
            ...state,
            itemsById,
            bookmarkedItems: bookmarks,
        };
    }

    case SET_NEW_ITEMS_BY_TOPIC: {
        const newItemsByTopic = Object.assign({}, state.newItemsByTopic);
        action.data.topics.map((topic) => {
            const previous = newItemsByTopic[topic] || [];
            newItemsByTopic[topic] = previous.concat([action.data.item]);
        });

        let itemsById = state.itemsById;
        if (get(action.data, 'item._id') && state.itemsById[action.data.item._id]) {
            itemsById = Object.assign({}, itemsById);
            itemsById[action.data.item._id] = action.data.item;
        }

        return {
            ...state,
            itemsById,
            newItemsByTopic,
        };
    }

    case REMOVE_NEW_ITEMS: {
        const newItemsByTopic = Object.assign({}, state.newItemsByTopic);
        newItemsByTopic[action.data] = null;
        return {
            ...state,
            newItemsByTopic
        };
    }

    case SET_NEW_ITEMS: {
        const newItems = action.data._items.filter((item) => !item.nextversion && !state.itemsById[item._id]).map((item) => item._id);
        const newItemsData = action.data;
        return {
            ...state,
            newItems,
            newItemsData,
        };
    }

    case TOGGLE_NAVIGATION:
        return {...state, wire: _wireReducer(state.wire, action)};

    case TOGGLE_FILTER:
    case SET_CREATED_FILTER:
    case RESET_FILTER:
    case SET_VIEW:
        return {...state, wire: _wireReducer(state.wire, action)};

    case START_LOADING:
        return {...state, isLoading: true};

    case SET_TOPICS:
        return {...state, topics: action.topics};

    default:
        return state;
    }
}
