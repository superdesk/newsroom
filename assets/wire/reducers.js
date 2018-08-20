import {
    RECIEVE_ITEMS,
    INIT_DATA,
    TOGGLE_NEWS,
} from './actions';

import { get } from 'lodash';

import { defaultReducer } from '../reducers';
import { searchReducer } from 'search/reducers';

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
    newItemsData: null,
    newItemsByTopic: {},
    readItems: {},
    wire: {
        newsOnly: false,
    },
    search: searchReducer(),
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


function _wireReducer(state, action) {
    switch (action.type) {

    case TOGGLE_NEWS: {
        return {
            ...state,
            newsOnly: !state.newsOnly,
        };
    }

    default:
        return state;
    }
}

export default function wireReducer(state = initialState, action) {
    switch (action.type) {

    case RECIEVE_ITEMS:
        return recieveItems(state, action.data);

    case INIT_DATA: {
        const navigations = get(action, 'wireData.navigations', []);
        return {
            ...state,
            readItems: action.readData || {},
            user: action.wireData.user || null,
            topics: action.wireData.topics || [],
            company: action.wireData.company || null,
            bookmarks: action.wireData.bookmarks || false,
            formats: action.wireData.formats || [],
            wire: Object.assign({}, state.wire, {newsOnly: action.newsOnly}),
            search: Object.assign({}, state.search, {navigations}),
            context: 'wire',
        };
    }

    case TOGGLE_NEWS:
        return {...state, wire: _wireReducer(state.wire, action)};

    default:
        return defaultReducer(state || initialState, action);
    }
}
