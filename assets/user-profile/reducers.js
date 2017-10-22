
import {
    GET_TOPICS,
    SELECT_MENU,
    INIT_DATA,
    SET_ERROR,
    GET_USER,
    RENDER_MODAL,
    CLOSE_MODAL,
} from './actions';

const initialState = {
    user: null,
    company: null,
    topics: null,
    topicsById: {},
    activeTopicId: null,
    selectedMenu: 'topics',
    isLoading: false,
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
        };
    }
    
    case INIT_DATA: {
        return {
            ...state,
            user: action.data.user || null,
            topics: action.data.topics || [],
            company: action.data.company || null,
        };
    }

    case SELECT_MENU: {
        return {
            ...state,
            activeTopicId: null,
            selectedMenu: action.data.target.name
        };
    }

    case RENDER_MODAL:
        return {...state, modal: {modal: action.modal, data: {topic: action.data}}};

    case CLOSE_MODAL:
        return {...state, modal: null};

    case SET_ERROR:
        return {...state, errors: action.errors};

    default:
        return state;
    }
}
