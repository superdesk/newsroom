export const INIT_DATA = 'INIT_DATA';
export function initData(data) {
    return {type: INIT_DATA, data};
}

export const OPEN_ITEM = 'OPEN_ITEM';
export function openItemDetails(item) {
    return {type: OPEN_ITEM, item};
}