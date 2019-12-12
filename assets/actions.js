import { get, differenceBy } from 'lodash';
import server from 'server';

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

export const MODAL_FORM_VALID = 'MODAL_FORM_VALID';
export function modalFormValid() {
    return (dispatch, getState) => {
        if (!get(getState(), 'modal.formValid')) {
            dispatch({type: MODAL_FORM_VALID});
        }

        return Promise.resolve();
    };
}

export const MODAL_FORM_INVALID = 'MODAL_FORM_INVALID';
export function modalFormInvalid() {
    return (dispatch, getState) => {
        if (get(getState(), 'modal.formValid')) {
            dispatch({type: MODAL_FORM_INVALID});
        }

        return Promise.resolve();
    };
}

export const USER_PROFILE_CLOSED = 'USER_PROFILE_CLOSED';
export function userProfileClosed() {
    return {type: USER_PROFILE_CLOSED};
}

export const ADD_EDIT_USERS = 'ADD_EDIT_USERS';
export function getEditUsers(item) {
    return function (dispatch, getState) {
        let findUsers = [];
        const itemUsers = ([
            item.original_creator,
            item.version_creator
        ].filter((u) => u));
        const editUsers = getState().editUsers || [];

        if (!get(item, 'version_creator') && !get(item, 'original_creator')) {
            return Promise.resolve();
        }
        
        findUsers = differenceBy(editUsers, itemUsers.map((u) => ({ '_id': u})), '_id');
        if (editUsers.length === 0 || findUsers.length > 0) {
            return server.get(`/users/search?ids=${itemUsers.join(',')}`)
                .then((data) => {
                    dispatch({
                        type: ADD_EDIT_USERS,
                        data
                    });
                });    
        }

        return Promise.resolve();
    };    
}
