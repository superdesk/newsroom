
import {
    NEW_NOTIFICATION,
    INIT_DATA,
    CLEAR_NOTIFICATION,
    CLEAR_ALL_NOTIFICATIONS,
    SET_BOOKMARKS_COUNT,
} from './actions';

const initialState = {
    user: null,
    notifications: [],
    bookmarksCount: 0,
};

export default function notificationReducer(state = initialState, action) {
    switch (action.type) {

    case NEW_NOTIFICATION: {
        const notifications = state.notifications.concat([action.notification.item]);

        return {
            ...state,
            notifications,
        };
    }

    case CLEAR_ALL_NOTIFICATIONS:
        return {
            ...state,
            notifications: [],
        };


    case CLEAR_NOTIFICATION:{
        const notifications = state.notifications.filter((n) => n._id !== action.id);
        return {
            ...state,
            notifications,
        };
    }

    case INIT_DATA: {
        return {
            ...state,
            user: action.data.user || null,
            notifications: action.data.notifications || [],
            bookmarksCount: action.data.bookmarksCount || 0,
        };
    }

    case SET_BOOKMARKS_COUNT:
        return {...state, bookmarksCount: action.count};

    default:
        return state;
    }
}
