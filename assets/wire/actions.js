import server from 'server';

export const SET_STATE = 'SET_STATE';
export function setState(state) {
    return {type: SET_STATE, state};
}

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

export const QUERY_ITEMS = 'QUERY_ITEMS';
export function queryItems() {
    return {type: QUERY_ITEMS};
}

export const RECIEVE_ITEMS = 'RECIEVE_ITEMS';
export function recieveItems(data) {
    return {type: RECIEVE_ITEMS, data};
}

export function fetchItems() {
    return function (dispatch, getState) {
        dispatch(queryItems());

        const query = getState().query || '';

        return server.get(`/search?q=${query}`)
            .then(
                (response) => response.json(),
                (reason) => console.error(reason)
            )
            .then((data) =>
                dispatch(recieveItems(data))
            );
    };
}
