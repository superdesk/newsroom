import {omit} from 'lodash';
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
        return {
            ...state,
            config: omit(action.data, ['_updated', 'version_creator']),
            _updated: action.data._updated,
            version_creator: action.data.version_creator,
        };
    
    case UPDATE_VALUES: {
        let config = Object.assign({}, state.config);
        Object.keys(action.data.values).forEach((key) => {
            if (!['_updated', 'version_creator'].includes(key)) {
                config[key].value = action.data.values[key] || null;
            }
        });

        return {
            ...state,
            ...config,
            _updated: action.data._updated,
            version_creator: action.data.version_creator,
        };
    }

    default:
        return state;
    }
}