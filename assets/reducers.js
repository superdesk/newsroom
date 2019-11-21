import {uniq, get, isEmpty} from 'lodash';
import {
    CLOSE_MODAL, RENDER_MODAL, MODAL_FORM_VALID, MODAL_FORM_INVALID,
    SAVED_ITEMS_COUNT,
} from 'actions';
import {searchReducer} from 'search/reducers';

import {
    BOOKMARK_ITEMS,
    COPY_ITEMS,
    DOWNLOAD_ITEMS,
    OPEN_ITEM,
    PREVIEW_ITEM,
    PRINT_ITEMS,
    QUERY_ITEMS,
    RECIEVE_ITEM,
    RECIEVE_NEXT_ITEMS,
    REMOVE_BOOKMARK,
    SELECT_ALL,
    SELECT_NONE,
    SET_ACTIVE,
    SET_ITEMS,
    SET_NEW_ITEMS,
    SET_STATE,
    SHARE_ITEMS,
    START_LOADING,
    TOGGLE_SELECTED,
    EXPORT_ITEMS,
} from './wire/actions';

import {
    SET_QUERY,
    ADD_TOPIC,
    SET_TOPICS,
    SET_NEW_ITEMS_BY_TOPIC,
} from 'search/actions';

import {getMaxVersion} from 'local-store';
import {REMOVE_NEW_ITEMS} from './agenda/actions';
import {toggleValue} from 'utils';

export function modalReducer(state, action) {
    switch (action.type) {
    case RENDER_MODAL:
        return {
            modal: action.modal,
            data: action.data,
            modalProps: action.modalProps
        };

    case CLOSE_MODAL:
        return null;

    case MODAL_FORM_VALID:
        return {
            ...state,
            formValid: true,
        };

    case MODAL_FORM_INVALID:
        return {
            ...state,
            formValid: false,
        };

    default:
        return state;
    }
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



export function defaultReducer(state={}, action) {
    if (!action) {
        return state;
    }

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

    case PREVIEW_ITEM: {
        const readItems = getReadItems(state, action.item, action.group);

        return {
            ...state,
            readItems,
            previewItem: action.item ? action.item._id : null,
            previewGroup: action.group,
            previewPlan: action.plan,
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
            previewGroup: action.group || null,
            previewPlan: action.plan,
        };
    }

    case SET_QUERY: {
        const search = Object.assign({}, state.search, {activeTopic: null});
        return {...state, query: action.query, activeItem: null, search: search};
    }

    case QUERY_ITEMS: {
        const resultsFiltered = !isEmpty(get(state, 'search.activeFilter')) ||
            !isEmpty(get(state, 'search.createdFilter.from')) ||
            !isEmpty(get(state, 'search.createdFilter.to'));
        return {
            ...state,
            searchInitiated: true,
            isLoading: true,
            totalItems: null,
            activeQuery: state.query,
            resultsFiltered,
        };
    }

    case RECIEVE_ITEM: {
        const itemsById = Object.assign({}, state.itemsById);
        itemsById[action.data._id] = action.data;
        return  {...state, itemsById};
    }

    case RECIEVE_NEXT_ITEMS: {
        const itemsById = Object.assign({}, state.itemsById);
        const newItems = action.data._items.map((item) => {
            if (!itemsById[item._id]) {
                itemsById[item._id] = item;
            }
            return item._id;
        });
        return {...state, items: uniq([...state.items, ...newItems]), itemsById, isLoading: false};
    }

    case SET_STATE:
        return Object.assign({}, action.state);

    case RENDER_MODAL:
    case CLOSE_MODAL:
    case MODAL_FORM_VALID:
    case MODAL_FORM_INVALID:
        return {...state, modal: modalReducer(state.modal, action)};

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

    case EXPORT_ITEMS: {
        const itemsById = updateItemActions(state, action.items, 'exports');

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
        return {
            ...state,
            newItems: uniq([
                ...state.newItems,
                ...(action.data._items.filter((item) => !item.nextversion && !state.itemsById[item._id]).map((item) => item._id))
            ]),
        };
    }

    case START_LOADING:
        return {...state, isLoading: true};

    case SET_TOPICS:
        return {...state, topics: action.topics};

    case SAVED_ITEMS_COUNT:
        return {...state, savedItemsCount: action.count};

    default: {
        const search = searchReducer(state.search, action);

        if (search !== state.search) {
            return {...state, search};
        }

        return state;
    }

    }
}
