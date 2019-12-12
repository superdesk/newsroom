import server from '../server';
import {errorHandler, recordAction} from 'utils';
import {get} from 'lodash';

export const INIT_DATA = 'INIT_DATA';
export function initData(data) {
    return {type: INIT_DATA, data};
}

function openItem(item) {
    return {type: OPEN_ITEM, item};
}

export const OPEN_ITEM = 'OPEN_ITEM';
export function openItemDetails(item) {
    return (dispatch, getState) => {
        dispatch(openItem(item, get(getState(), 'context')));
        recordAction(item, 'open');
    };
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

export function pushNotification(push) {
    return () => {
        if (push.event === 'items_deleted') {
            setTimeout(
                () => window.location.reload(),
                1000
            );
        }
    };
}
