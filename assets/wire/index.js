import { createStore, render, initWebSocket, getInitData, closeItemOnMobile, isMobilePhone } from 'utils';

import wireReducer from './reducers';
import {getNewsOnlyParam, getReadItems} from 'local-store';
import WireApp from './components/WireApp';
import {
    fetchItems,
    setState,
    initData,
    pushNotification,
    initParams,
    openItemDetails,
    previewItem,
} from './actions';
import { setView } from 'search/actions';

const store = createStore(wireReducer, 'Wire');

// init data
store.dispatch(initData(getInitData(window.wireData), getReadItems(), getNewsOnlyParam()));

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
            store.dispatch(fetchItems());
        }
    }
};

// init query, filter, navigation and start date
const params = new URLSearchParams(window.location.search);
store.dispatch(initParams(params));


// fetch items & render
store.dispatch(fetchItems()).then(() =>
    render(store, WireApp, document.getElementById('wire-app'))
);

// initialize web socket listener
initWebSocket(store, pushNotification);
