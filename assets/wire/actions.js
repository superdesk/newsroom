
export const SET_ITEMS = 'SET_ITEMS';
export function setItems(items) {
    return {type: SET_ITEMS, items};
}

export const PREVIEW_ITEM = 'PREVIEW_ITEM';
export function previewItem(id) {
    return {type: PREVIEW_ITEM, id};
}

export const SET_QUERY = 'SET_QUERY';
export function setQuery(query) {
    return {type: SET_QUERY, query};
}
