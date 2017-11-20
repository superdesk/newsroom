
import {
    CLOSE_MODAL,
    RENDER_MODAL,
} from 'actions';

export function modalReducer(state, action) {
    switch (action.type) {
    case RENDER_MODAL:
        return {modal: action.modal, data: action.data};

    case CLOSE_MODAL:
        return null;

    default:
        return state;
    }
}
