import {
    INIT_VIEW_DATA,
    UPDATE_VALUES,
} from './actions';

const initialState = {
    config: {},
};

export default function settingsReducer(state=initialState, action) {
    switch (action.type) {

    case INIT_VIEW_DATA:
        return {...state, config: action.data};
    
    case UPDATE_VALUES: {
        const config = Object.assign({}, state.config);
        Object.keys(action.values).forEach((key) => {
            config[key].value = action.values[key] || null;
        });
        return {...state, config};
    }

    default:
        return state;
    }
}