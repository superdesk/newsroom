import { gettext, notify, errorHandler } from 'utils';
import server from 'server';
import {initSections} from 'features/sections/actions';
import {activeSectionSelector} from 'features/sections/selectors';
import {searchQuerySelector} from 'search/selectors';

// number of image that a navigation can have
export const MAX_TILE_IMAGES = 4;

export const SELECT_NAVIGATION = 'SELECT_NAVIGATION';
export function selectNavigation(id) {
    return {type: SELECT_NAVIGATION, id};
}

export const EDIT_NAVIGATION = 'EDIT_NAVIGATION';
export function editNavigation(event) {
    return {type: EDIT_NAVIGATION, event};
}

export const NEW_NAVIGATION = 'NEW_NAVIGATION';
export function newNavigation() {
    return {type: NEW_NAVIGATION};
}

export const CANCEL_EDIT = 'CANCEL_EDIT';
export function cancelEdit(event) {
    return {type: CANCEL_EDIT, event};
}

export const QUERY_NAVIGATIONS = 'QUERY_NAVIGATIONS';
export function queryNavigations() {
    return {type: QUERY_NAVIGATIONS};
}

export const GET_NAVIGATIONS = 'GET_NAVIGATIONS';
export function getNavigations(data) {
    return {type: GET_NAVIGATIONS, data};
}

export const GET_PRODUCTS = 'GET_PRODUCTS';
export function getProducts(data) {
    return {type: GET_PRODUCTS, data};
}

export const SET_ERROR = 'SET_ERROR';
export function setError(errors) {
    return {type: SET_ERROR, errors};
}


/**
 * Fetches navigations
 *
 */
export function fetchNavigations() {
    return function (dispatch, getState) {
        dispatch(queryNavigations());
        const query = searchQuerySelector(getState()) || '';

        return server.get(`/navigations/search?q=${query}`)
            .then((data) => dispatch(getNavigations(data)))
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}


/**
 * Creates new navigations
 *
 */
export function postNavigation() {
    return function (dispatch, getState) {

        const navigation = getState().navigationToEdit;
        if (!navigation._id) {
            // set the action section for new navigation
            navigation.product_type = activeSectionSelector(getState());
        }

        const url = `/navigations/${navigation._id ? navigation._id : 'new'}`;
        let data = new FormData();

        data.append('navigation', JSON.stringify(navigation));
        for(let i = 0; i < MAX_TILE_IMAGES; i++) {
            const fileInput = document.getElementById(`tile_images_file_${i}`);
            if (fileInput && fileInput.files.length > 0) {
                data.append(`file${i}`, fileInput.files[0]);
            }
        }

        return server.postFiles(url, data)
            .then(function() {
                if (navigation._id) {
                    notify.success(gettext('Navigation updated successfully'));
                } else {
                    notify.success(gettext('Navigation created successfully'));
                }
                dispatch(fetchNavigations());
            })
            .catch((error) => errorHandler(error, dispatch, setError));

    };
}


/**
 * Deletes a navigation
 *
 */
export function deleteNavigation() {
    return function (dispatch, getState) {

        const navigation = getState().navigationToEdit;
        const url = `/navigations/${navigation._id}`;

        return server.del(url)
            .then(() => {
                notify.success(gettext('Navigation deleted successfully'));
                dispatch(fetchNavigations());
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}


/**
 * Fetches products
 *
 */
export function fetchProducts() {
    return function (dispatch) {
        return server.get('/products/search')
            .then((data) => {
                dispatch(getProducts(data));
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}


/**
 * Saves products for a navigation
 *
 */
export function saveProducts(products) {
    return function (dispatch, getState) {
        const navigation = getState().navigationToEdit;
        return server.post(`/navigations/${navigation._id}/products`, {products})
            .then(() => {
                notify.success(gettext('Navigation updated successfully'));
                dispatch(fetchProducts());
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}


export function initViewData(data) {
    return function (dispatch) {
        dispatch(getNavigations(data.navigations));
        dispatch(getProducts(data.products));
        dispatch(initSections(data.sections));
    };
}

