
import {
    GET_TOPICS,
    INIT_DATA,
    SET_ERROR,
    GET_USER,
    EDIT_USER,
    SELECT_MENU, HIDE_MODAL, TOGGLE_DROPDOWN,
} from './actions';

import {
    RENDER_MODAL,
    CLOSE_MODAL,
} from 'actions';

import { modalReducer } from 'reducers';

const initialState = {
    user: null,
    editedUser: null,
    company: null,
    topics: null,
    topicsById: {},
    activeTopicId: null,
    isLoading: false,
    selectedMenu: 'profile',
    dropdown: false,
    displayModal: false,
};

export default function itemReducer(state = initialState, action) {
    switch (action.type) {

    case GET_TOPICS: {
        const topicsById = Object.assign({}, state.topicsById);
        const topics = action.topics.map((topic) => {
            topicsById[topic._id] = topic;
            return topic;
        });

        return {
            ...state,
            topics,
            topicsById,
            activeTopicId: null,
            isLoading: false
        };
    }

    case GET_USER: {
        return {
            ...state,
            user: action.user,
            editedUser: action.user,
        };
    }

    case EDIT_USER: {

        const target = action.event.target;
        const field = target.name;
        const editedUser = Object.assign({}, state.editedUser);
        editedUser[field] = target.type === 'checkbox' ? target.checked : target.value;
        return {...state, editedUser, errors: null};
    }

    case INIT_DATA: {
        return {
            ...state,
            user: action.data.user || null,
            editedUser: action.data.user || null,
            topics: action.data.topics || [],
            company: action.data.company || null,
        };
    }

    case SELECT_MENU: {
        return {
            ...state,
            selectedMenu: action.data,
            dropdown: false,
            displayModal: true,
        };
    }

    case TOGGLE_DROPDOWN : {
        return {
            ...state,
            dropdown: !state.dropdown,
        };
    }

    case HIDE_MODAL: {
        return {
            ...state,
            displayModal: false,
        };
    }

    case RENDER_MODAL:
    case CLOSE_MODAL:
        return {...state, modal: modalReducer(state.modal, action)};

    case SET_ERROR:
        return {...state, errors: action.errors};

    default:
        return state;
    }
}
