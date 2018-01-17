
import {
    INIT_DATA,
} from './actions';

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
        };

    default:
        return state;
    }
}
