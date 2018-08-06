import {
    PREVIEW_ITEM,
    OPEN_ITEM,
    SET_ITEMS,
    SET_QUERY,
    SET_EVENT_QUERY,
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
    TOGGLE_TOPIC,
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
    SET_TOPICS, SELECT_DATE,
} from './actions';

import { RENDER_MODAL, CLOSE_MODAL } from 'actions';

import { get, isEmpty } from 'lodash';
import { toggleValue } from 'utils';
import { EXTENDED_VIEW } from 'wire/defaults';

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
    context: null,
    formats: [],
    newItems: [],
    newItemsData: null,
    newItemsByTopic: {},
    readItems: {},
    resultsFiltered: false,
    agenda: {
        navigations: [],
        activeNavigation: null,
        activeFilter: {},
        createdFilter: {},
        activeView: EXTENDED_VIEW,
        activeTopic: null,
        activeDate: Date.now(),
        activeGrouping: 'day',
    },
    detail: false,
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
        resultsFiltered: !isEmpty(state.agenda.activeFilter) || !isEmpty(state.agenda.createdFilter)
    };
}


function _agendaReducer(state, action) {
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

    case TOGGLE_TOPIC: {
        const activeTopic = action.topic ? action.topic._id : null;

        return {
            ...state,
            activeFilter: {},
            createdFilter: {},
            activeTopic,
        };
    }

    case TOGGLE_FILTER: {
        const activeFilter = Object.assign({}, state.activeFilter);
        activeFilter[action.key] = toggleValue(activeFilter[action.key], action.val);
        if (!action.val || !activeFilter[action.key] || activeFilter[action.key].length === 0) {
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

    case SELECT_DATE:
        return {
            ...state,
            selectedItems: [],
            activeDate: action.dateString,
            activeGrouping: action.grouping || 'day',
        };

    default:
        return state;
    }
}

export default function agendaReducer(state = initialState, action) {
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

    case SET_EVENT_QUERY:
        return {...state, queryId: action.query, activeItem: null};


    case INIT_DATA: {
        const navigations = get(action, 'agendaData.navigations', []);
        const openItem = get(action, 'agendaData.item', null);
        return {
            ...state,
            readItems: action.readData || {},
            user: action.agendaData.user || null,
            topics: action.agendaData.topics || [],
            company: action.agendaData.company || null,
            companyName: action.agendaData.companyName || '',
            bookmarks: action.agendaData.bookmarks || false,
            formats: action.agendaData.formats || [],
            agenda: Object.assign(state.agenda, {navigations}),
            context: 'agenda',
            openItem: openItem,
            detail: !!openItem,
        };
    }


    case SELECT_DATE:
    case TOGGLE_TOPIC:
    case TOGGLE_NAVIGATION:
    case TOGGLE_FILTER:
    case SET_CREATED_FILTER:
    case RESET_FILTER:
    case SET_VIEW:
        return {...state, agenda: _agendaReducer(state.agenda, action)};


    default:
        return state;
    }
}
