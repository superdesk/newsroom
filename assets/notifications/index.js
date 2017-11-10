import 'babel-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';

import notificationReducer from './reducers';
import NotificationApp from './components/NotificationsApp';
import {initData, pushNotification} from './actions';

const loggerMiddleware = createLogger({
    duration: true,
    collapsed: true,
    timestamp: false,
});


const store = createStore(
    notificationReducer,
    applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
    )
);


if (window.notificationData) {
    store.dispatch(initData(window.notificationData));
}


render(
    <Provider store={store}>
        <NotificationApp />
    </Provider>,
    document.getElementById('header-notification')
);


if (window.newsroom) {
    const ws = new WebSocket(window.newsroom.websocket);
    ws.onmessage = (message) => {
        const data = JSON.parse(message.data);
        if (data.event) {
            store.dispatch(pushNotification(data));
        }
    };
}

