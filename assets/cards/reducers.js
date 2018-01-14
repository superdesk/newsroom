
import {
    GET_CARDS,
    SELECT_CARD,
    EDIT_CARD,
    QUERY_CARDS,
    SET_QUERY,
    CANCEL_EDIT,
    NEW_CARD,
    SET_ERROR,
    GET_PRODUCTS,
} from './actions';

const initialState = {
    query: null,
    cards: [],
    cardsById: {},
    activeCardId: null,
    isLoading: false,
    totalCards: null,
    activeQuery: null,
    products: [],
};

const cardSizes = {
    '6-text-only': 6,
    '4-picture-text': 4,
};

export default function cardReducer(state = initialState, action) {
    switch (action.type) {

    case SELECT_CARD: {
        const defaultCard = {
            label: '',
            type: '',
            config: {},
        };

        return {
            ...state,
            activeCardId: action.id || null,
            cardToEdit: action.id ? Object.assign(defaultCard, state.cardsById[action.id]) : null,
            errors: null,
        };
    }

    case EDIT_CARD: {
        const target = action.event.target;
        const field = target.name;
        let card = state.cardToEdit;

        if (field === 'product') {
            card['config']['product'] = target.value;
        } else {
            card[field] = target.value;
        }

        card['config']['size'] = cardSizes[state.cardToEdit.type];

        return {...state, cardToEdit: card, errors: null};
    }

    case NEW_CARD: {
        const cardToEdit = {
            label: '',
            type: '',
            config: {},
        };

        return {...state, cardToEdit, errors: null};
    }

    case CANCEL_EDIT: {
        return {...state, cardToEdit: null, errors: null};
    }

    case SET_QUERY:
        return {...state, query: action.query};

    case SET_ERROR:
        return {...state, errors: action.errors};

    case QUERY_CARDS:
        return {...state,
            isLoading: true,
            totalCards: null,
            cardToEdit: null,
            activeQuery: state.query};

    case GET_CARDS: {
        const cardsById = Object.assign({}, state.cardsById);
        const cards = action.data.map((card) => {
            cardsById[card._id] = card;
            return card._id;
        });

        return {...state, cards, cardsById, isLoading: false, totalCards: cards.length};
    }

    case GET_PRODUCTS: {
        return {...state, products: action.data};
    }

    default:
        return state;
    }
}
