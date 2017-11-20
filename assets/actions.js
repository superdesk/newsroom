
export const RENDER_MODAL = 'RENDER_MODAL';
export function renderModal(modal, data) {
    return {type: RENDER_MODAL, modal, data};
}

export const CLOSE_MODAL = 'CLOSE_MODAL';
export function closeModal() {
    return {type: CLOSE_MODAL};
}
