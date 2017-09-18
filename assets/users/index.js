import 'babel-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';

import userReducer from './reducers';
import UsersApp from './components/UsersApp';
import { fetchUsers, fetchCompanies } from './actions';

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
store.dispatch(fetchUsers());
store.dispatch(fetchCompanies());

render(
    <Provider store={store}>
        <UsersApp />
    </Provider>,
    document.getElementById('users-app')
);
