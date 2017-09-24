import 'babel-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';

import userReducer from './reducers';
import SettingsApp from './components/SettingsApp';
import { fetchItems, fetchCompanies } from './actions';

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

// init users and companies
store.dispatch(fetchItems());
store.dispatch(fetchCompanies());

render(
    <Provider store={store}>
        <SettingsApp />
    </Provider>,
    document.getElementById('settings-app')
);
