
import {
    INIT_DATA,
    OPEN_ITEM,
    SET_ACTIVE,
    SET_CARD_ITEMS,
} from './actions';
import {BOOKMARK_ITEMS, REMOVE_BOOKMARK} from '../wire/actions';
import {CLOSE_MODAL, MODAL_FORM_VALID, RENDER_MODAL} from '../actions';
import {modalReducer} from '../reducers';

const initialState = {
    cards: [],
    itemsByCard: {},
    products: [],
    activeCard: null,
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
            userType: action.data.userType,
            company: action.data.company,
            formats: action.data.formats || [],
            userSections: action.data.userSections,
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
        return state;
    }
}
