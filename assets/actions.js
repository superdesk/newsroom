
export const RENDER_MODAL = 'RENDER_MODAL';
export function renderModal(modal, data) {
    return {type: RENDER_MODAL, modal, data};
}

export const CLOSE_MODAL = 'CLOSE_MODAL';
export function closeModal() {
    return {type: CLOSE_MODAL};
}

export const SAVED_ITEMS_COUNT = 'SAVED_ITEMS_COUNT';
export function setSavedItemsCount(count) {
    return {type: SAVED_ITEMS_COUNT, count: count};
}

export const SET_UI_CONFIG = 'SET_UI_CONFIG';
export function setUiConfig(config) {
    return {type: SET_UI_CONFIG, config: config};
}
