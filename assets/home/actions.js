import analytics from 'analytics';

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