import {
    INIT_DASHBOARD,
    SELECT_DASHBOARD,
} from './actions';

const INITIAL_STATE = {
    list: [],
    active: '',
};

export function dashboardReducer(state=INITIAL_STATE, action) {
    if (!action) {
        return state;
    }

    switch (action.type) {
    
    case INIT_DASHBOARD:
        return {...state, list: action.dashboards, active: action.dashboards[0]._id};
    
    case SELECT_DASHBOARD:
        return {...state, active: action.dashboard || ''};

    default:
        return state;
    }
}