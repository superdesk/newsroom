import analytics from 'analytics';
import server from '../server';
import {errorHandler} from 'utils';
import {get} from 'lodash';

export const INIT_DATA = 'INIT_DATA';
export function initData(data) {
    return {type: INIT_DATA, data};
}

export const OPEN_ITEM = 'OPEN_ITEM';
export function openItemDetails(item) {
    analytics.itemEvent('open', item);
    analytics.itemView(item);
    return {type: OPEN_ITEM, item};
}

export const SET_ACTIVE = 'SET_ACTIVE';
export function setActive(cardId) {
    return {type: SET_ACTIVE, cardId};
}

export const SET_CARD_ITEMS = 'SET_CARD_ITEMS';
export function setCardItems(cardLabel, items) {
    return {type: SET_CARD_ITEMS, payload: {card: cardLabel, items: items}};
}

export function fetchCardExternalItems(cardId, cardLabel) {
    return (dispatch) => {
        return server.get(`/media_card_external/${cardId}`)
            .then((data) => dispatch(
                setCardItems(cardLabel, get(data, '_items', []))
            ))
            .catch(errorHandler);
    };
}
