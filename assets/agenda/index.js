import { createStore, render, initWebSocket } from 'utils';

import agendaReducer from './reducers';
import {getReadItems} from 'wire/utils';
import AgendaApp from './components/AgendaApp';
import { fetchItems, setState, initData, initParams, pushNotification, setView } from './actions';

const store = createStore(agendaReducer);

// init data
store.dispatch(initData(window.agendaData || {}, getReadItems()));

// init query
const params = new URLSearchParams(window.location.search);
store.dispatch(initParams(params));

// init view
if (localStorage.getItem('view')) {
    store.dispatch(setView(localStorage.getItem('view')));
}

// handle history
window.onpopstate = function(event) {
    store.dispatch(setState(event.state));
};

// fetch items & render
store.dispatch(fetchItems()).then(() =>
    render(store, AgendaApp, document.getElementById('agenda-app'))
);

// initialize web socket listener
initWebSocket(store, pushNotification);
