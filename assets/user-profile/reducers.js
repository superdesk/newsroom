
import {
    GET_TOPICS,
    INIT_DATA,
    SET_ERROR,
    GET_USER,
    EDIT_USER,
    SELECT_MENU, HIDE_MODAL, TOGGLE_DROPDOWN,
    SELECT_MENU_ITEM,
    SELECT_PROFILE_MENU,
    SET_TOPIC_EDITOR_FULLSCREEN,
} from './actions';

import { RENDER_MODAL, CLOSE_MODAL, MODAL_FORM_VALID, MODAL_FORM_INVALID } from 'actions';
import {GET_COMPANY_USERS} from 'companies/actions';
import {SET_USER_COMPANY_MONITORING_LIST} from 'monitoring/actions';

import {modalReducer} from 'reducers';
import {GET_NAVIGATIONS} from 'navigations/actions';

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
    navigations: [],
    selectedItem: null,
    editorFullscreen: false,
    locators: [],
};

export default function itemReducer(state = initialState, action) {
    let newSelected, newState;
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

    case GET_NAVIGATIONS: {
        return {...state, navigations: action.data};
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
            userSections: action.data.userSections || null,
            locators: action.data.locators || null,
            monitoringList: action.data.monitoring_list || [],
            monitoringAdministrator: action.data.monitoring_administrator,
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

    case SELECT_MENU_ITEM: {
        return {
            ...state,
            selectedItem: action.item,
            editorFullscreen: false,
        };
    }

    case SELECT_PROFILE_MENU: {
        return {
            ...state,
            selectedMenu: action.menu,
            selectedItem: action.item || state.selectedItem,
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
    case MODAL_FORM_VALID:
    case MODAL_FORM_INVALID:
        return {...state, modal: modalReducer(state.modal, action)};

    case SET_ERROR:
        return {...state, errors: action.errors};

    case SET_TOPIC_EDITOR_FULLSCREEN:
        return {
            ...state,
            editorFullscreen: action.payload,
        };

    case GET_COMPANY_USERS:
        return {...state, monitoringProfileUsers: action.data};

    case SET_USER_COMPANY_MONITORING_LIST:
        newSelected = state.selectedItem && (action.data || []).find((w) => w._id === state.selectedItem._id);
        newState = {
            ...state,
            monitoringList: action.data,

        };

        if (newSelected) {
            newState.selectedItem = newSelected;
        }

        return newState;        

    default:
        return state;
    }
}
