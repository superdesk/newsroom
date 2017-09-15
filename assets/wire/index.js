import 'babel-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';

import wireReducer from './reducers';
import WireApp from './components/WireApp';
import { fetchItems, setQuery, setState } from './actions';

const loggerMiddleware = createLogger({
    duration: true,
    collapsed: true,
    timestamp: false,
});

const store = createStore(
    wireReducer,
    applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
    )
);

// init query
const params = new URLSearchParams(window.location.search);
if (params.get('q')) {
    store.dispatch(setQuery(params.get('q')));
}

// init data
store.dispatch(fetchItems());

// handle history
window.onpopstate = function(event) {
    store.dispatch(setState(event.state));
};

render(
    <Provider store={store}>
        <WireApp />
    </Provider>,
    document.getElementById('wire-app')
);
