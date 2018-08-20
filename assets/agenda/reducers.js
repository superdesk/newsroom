import {
    SET_EVENT_QUERY,
    RECIEVE_ITEMS,
    INIT_DATA,
    SELECT_DATE,
} from './actions';

import { get } from 'lodash';
import { EXTENDED_VIEW } from 'wire/defaults';

import { searchReducer } from 'search/reducers';

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
    topics: [],
    selectedItems: [],
    bookmarks: false,
    context: null,
    formats: [],
    newItems: [],
    newItemsData: null,
    newItemsByTopic: {},
    readItems: {},
    agenda: {
        activeView: EXTENDED_VIEW,
        activeDate: Date.now(),
        activeGrouping: 'day',
    },
    search: searchReducer(),
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
    };
}


function _agendaReducer(state, action) {
    switch (action.type) {

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

    case RECIEVE_ITEMS:
        return recieveItems(state, action.data);

    case SET_EVENT_QUERY:
        return {...state, query: action.query, activeItem: null};

    case INIT_DATA: {
        const navigations = get(action, 'agendaData.navigations', []);
        const openItem = get(action, 'agendaData.item', null);
        return {
            ...state,
            readItems: action.readData || {},
            user: action.agendaData.user || null,
            topics: action.agendaData.topics || [],
            company: action.agendaData.company || null,
            bookmarks: action.agendaData.bookmarks || false,
            formats: action.agendaData.formats || [],
            search: Object.assign({}, state.search, {navigations}),
            context: 'agenda',
            openItem: openItem,
            detail: !!openItem,
        };
    }

    case SELECT_DATE:
        return {...state, agenda: _agendaReducer(state.agenda, action)};

    default:
        return defaultReducer(state || initialState, action);
    }
}
