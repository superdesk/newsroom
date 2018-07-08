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

import { get, isEmpty } from 'lodash';
import { toggleValue } from 'utils';
import { EXTENDED_VIEW } from './defaults';

import { defaultReducer } from '../reducers';

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
    resultsFiltered: false,
    wire: {
        navigations: [],
        activeNavigation: null,
        activeFilter: {},
        createdFilter: {},
        activeView: EXTENDED_VIEW,
        newsOnly: false,
    },
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
        resultsFiltered: !isEmpty(state.wire.activeFilter) || !isEmpty(state.wire.createdFilter)
    };
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
        if (!activeFilter[action.key] || activeFilter[action.key].length === 0) {
            delete activeFilter[action.key];
        }
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

    case SET_ITEMS:
    case SET_ACTIVE:
    case PREVIEW_ITEM:
    case OPEN_ITEM:
    case SET_QUERY:
    case QUERY_ITEMS:
    case RECIEVE_ITEM:
    case RECIEVE_NEXT_ITEMS:
    case RENDER_MODAL:
    case CLOSE_MODAL:
    case ADD_TOPIC:
    case TOGGLE_SELECTED:
    case SELECT_ALL:
    case SELECT_NONE:
    case SHARE_ITEMS:
    case DOWNLOAD_ITEMS:
    case COPY_ITEMS:
    case PRINT_ITEMS:
    case BOOKMARK_ITEMS:
    case REMOVE_BOOKMARK:
    case SET_NEW_ITEMS_BY_TOPIC:
    case REMOVE_NEW_ITEMS:
    case SET_NEW_ITEMS:
    case START_LOADING:
    case SET_TOPICS:
    case SET_STATE:
        return defaultReducer(state || initialState, action);


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
            companyName: action.wireData.companyName || '',
            bookmarks: action.wireData.bookmarks || false,
            formats: action.wireData.formats || [],
            wire: Object.assign(state.wire, {navigations, newsOnly: action.newsOnly}),
        };
    }

    case TOGGLE_NAVIGATION:
    case TOGGLE_NEWS:
    case TOGGLE_FILTER:
    case SET_CREATED_FILTER:
    case RESET_FILTER:
    case SET_VIEW:
        return {...state, wire: _wireReducer(state.wire, action)};


    default:
        return state;
    }
}
