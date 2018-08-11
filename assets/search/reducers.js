import { toggleValue } from 'utils';

import {
    SET_VIEW,
    TOGGLE_TOPIC,
    RESET_FILTER,
    TOGGLE_FILTER,
    TOGGLE_NAVIGATION,
    SET_CREATED_FILTER,
} from './actions';

import { EXTENDED_VIEW } from 'wire/defaults';

const INITIAL_STATE = {
    navigations: [],
    activeNavigation: null,
    activeFilter: {},
    createdFilter: {},
    activeTopic: null,
    activeView: EXTENDED_VIEW
};

export function searchReducer(state=INITIAL_STATE, action) {
    if (!action) {
        return state;
    }

    switch (action.type) {

    case TOGGLE_NAVIGATION: {
        const activeNavigation = action.navigation && action.navigation._id;

        return {
            ...state,
            activeFilter: {},
            createdFilter: {},
            activeNavigation,
        };
    }

    case TOGGLE_TOPIC: {
        const activeTopic = action.topic ? action.topic._id : null;

        return {
            ...state,
            activeFilter: {},
            createdFilter: {},
            activeTopic,
        };
    }

    case TOGGLE_FILTER: {
        const activeFilter = Object.assign({}, state.activeFilter);
        activeFilter[action.key] = toggleValue(activeFilter[action.key], action.val);
        if (!action.val || !activeFilter[action.key] || activeFilter[action.key].length === 0) {
            delete activeFilter[action.key];
        }
        else if (action.single) {
            activeFilter[action.key] = activeFilter[action.key].filter((val) => val === action.val);
        }
        return {
            ...state,
            activeFilter: activeFilter,
        };
    }

    case SET_CREATED_FILTER: {
        const createdFilter = Object.assign({}, state.createdFilter, action.filter);
        return {
            ...state,
            createdFilter,
        };
    }

    case RESET_FILTER:
        return {
            ...state,
            activeFilter: Object.assign({}, action.filter),
            createdFilter: {},
        };

    case SET_VIEW:
        return {
            ...state,
            activeView: action.view,
        };

    default:
        return state;
    }
}