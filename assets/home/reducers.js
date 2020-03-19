
import {
    INIT_DATA,
    OPEN_ITEM,
    SET_ACTIVE,
    SET_CARD_ITEMS,
} from './actions';
import {BOOKMARK_ITEMS, REMOVE_BOOKMARK} from '../wire/actions';
import {CLOSE_MODAL, MODAL_FORM_VALID, RENDER_MODAL} from '../actions';
import {modalReducer} from '../reducers';
import { topicsReducer } from '../topics/reducer';

const initialState = {
    cards: [],
    topics: [],
    products: [],
    itemsByCard: {},
    activeCard: null,
};

export default function homeReducer(state=initialState, action) {

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
            userSections: action.data.userSections,
            uiConfig: action.data.ui_config || {},
            topics: action.data.topics || [],
            context: 'wire'
        };

    case OPEN_ITEM:{
        return {
            ...state,
            itemToOpen: action.item || null,
        };
    }

    case SET_ACTIVE:
        return {
            ...state,
            activeCard: action.cardId || null,
        };

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

    case SET_CARD_ITEMS: {
        return {
            ...state,
            itemsByCard: {
                ...state.itemsByCard,
                [action.payload.card]: action.payload.items,
            },
        };
    }

    case RENDER_MODAL:
    case MODAL_FORM_VALID:
    case CLOSE_MODAL:
        return {...state, modal: modalReducer(state.modal, action)};

    default:
        return {...state, topics: topicsReducer(state.topics, action)};
    }
}
