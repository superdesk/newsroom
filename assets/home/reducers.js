
import {
    INIT_DATA,
    OPEN_ITEM,
} from './actions';
import {BOOKMARK_ITEMS, REMOVE_BOOKMARK} from '../wire/actions';
import {CLOSE_MODAL, RENDER_MODAL} from '../actions';
import {modalReducer} from '../reducers';

const initialState = {
    cards: [],
    itemsByCard: {},
    products: [],
};

export default function homeReducer(state = initialState, action) {
    switch (action.type) {

    case INIT_DATA:
        return {
            ...state,
            cards: action.data.cards,
            itemsByCard: action.data.itemsByCard,
            products: action.data.products,
            user: action.data.user,
            company: action.data.company,
            formats: action.data.formats || [],
        };

    case OPEN_ITEM:{
        return {
            ...state,
            itemToOpen: action.item || null,
        };
    }

    case BOOKMARK_ITEMS: {
        const itemToOpen = Object.assign({}, state.itemToOpen);
        itemToOpen.bookmarks = (itemToOpen.bookmarks || []).concat([state.user]);

        return {
            ...state,
            itemToOpen,
        };
    }

    case REMOVE_BOOKMARK: {
        const itemToOpen = Object.assign({}, state.itemToOpen);
        itemToOpen.bookmarks = (itemToOpen.bookmarks || []).filter((val) => val !== state.user);

        return {
            ...state,
            itemToOpen,
        };
    }

    case RENDER_MODAL:
    case CLOSE_MODAL:
        return {...state, modal: modalReducer(state.modal, action)};

    default:
        return state;
    }
}
