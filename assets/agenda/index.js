import { createStore, render, initWebSocket, getInitData, isMobilePhone, closeItemOnMobile } from 'utils';

import agendaReducer from './reducers';
import {getActiveDate, getReadItems, getFeaturedOnlyParam} from 'local-store';
import AgendaApp from './components/AgendaApp';
import { fetchItems, setState, initData, initParams, pushNotification, openItemDetails, previewItem } from './actions';
import { setView } from 'search/actions';

const store = createStore(agendaReducer, 'Agenda');

// init data
store.dispatch(initData(getInitData(window.agendaData), getReadItems(), getActiveDate(), getFeaturedOnlyParam()));


// init query
const params = new URLSearchParams(window.location.search);
store.dispatch(initParams(params));

// init view
if (localStorage.getItem('view')) {
    store.dispatch(setView(localStorage.getItem('view')));
}

// handle history
window.onpopstate = function(event) {
    if (event.state) {
        closeItemOnMobile(store.dispatch, event.state, openItemDetails, previewItem);
        if (!isMobilePhone()) {
            store.dispatch(setState(event.state));
            store.dispatch(fetchItems(false));
        }
    }
};


// fetch items & render
store.dispatch(fetchItems()).then(() =>
    render(store, AgendaApp, document.getElementById('agenda-app'))
);

// initialize web socket listener
initWebSocket(store, pushNotification);
