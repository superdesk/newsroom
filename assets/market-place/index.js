import { createStore, render, initWebSocket, getInitData} from '../utils';

import {getReadItems} from '../wire/utils';
import  MarketPlaceApp from './components/MarketPlaceApp';
import wireReducer from '../wire/reducers';
import {
    fetchItems,
    initData,
    initParams,
    pushNotification,
    setState
} from '../wire/actions';


const store = createStore(wireReducer);

// init data
store.dispatch(initData(getInitData(window.marketPlaceData), getReadItems(), false));

// init query
const params = new URLSearchParams(window.location.search);
store.dispatch(initParams(params));


// handle history
window.onpopstate = function(event) {
    if (event.state) {
        store.dispatch(setState(event.state));
    }
};

if (window.marketPlaceData.bookmarks) {
    store.dispatch(fetchItems()).then(() =>
        render(store, MarketPlaceApp, document.getElementById('market-place-app'))
    );
} else {
    render(store, MarketPlaceApp, document.getElementById('market-place-app'));
}

// initialize web socket listener
initWebSocket(store, pushNotification);
