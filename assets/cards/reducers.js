
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
    '4-media-gallery': 4,
    '4-photo-gallery': 4,
    '4-text-only': 4,
    '1x1-top-news': 2,
    '2x2-top-news': 4,
    '3-text-only': 3,
    '3-picture-text': 3,
    '2x2-events': 4,
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

        if (field === 'type') {
            if (target.value == '2x2-events') {
                card['config'] = {events: [{}, {}, {}, {}]};
            } else {
                card['config'] = {};
            }

            card[field] = target.value;

        } else if (field === 'product') {
            card['config']['product'] = target.value;
        } else if (field.indexOf('event') >= 0) {
            const eventData = field.split('_');
            const events = card['config']['events'] || [{}, {}, {}, {}];
            events[parseInt(eventData[1])][eventData[2]] = target.value;
            card['config']['events'] = events;
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
