import 'babel-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';

import userReducer from './reducers';
import UserProfileApp from './components/UserProfileApp';
import {initData} from './actions';

const loggerMiddleware = createLogger({
    duration: true,
    collapsed: true,
    timestamp: false,
});



const store = createStore(
    userReducer,
    applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
    )
);

if (window.profileData) {
    store.dispatch(initData(window.profileData));
}

render(
    <Provider store={store}>
        <UserProfileApp />
    </Provider>,
    document.getElementById('user-profile-app')
);
