import { createStore, render, initWebSocket, getInitData} from '../utils';

import {getReadItems} from 'local-store';
import  MarketPlaceApp from './components/MarketPlaceApp';
import wireReducer from '../wire/reducers';
import WireApp from '../wire/components/WireApp';
import marketPlaceHomeReducer from './reducers';

import {
    fetchItems,
    initData,
    initParams,
    pushNotification,
    setState
} from '../wire/actions';

import {
    toggleNavigationById
} from 'search/actions';

import {
    initData as homeInitData
} from './actions';

const handleHistory = () => {
    // handle history
    window.onpopstate = function(event) {
        if (event.state) {
            store.dispatch(setState(event.state));
        }
    };
};

let store;

if (window.marketPlaceData.home_page) {
    store = createStore(marketPlaceHomeReducer);
    store.dispatch(homeInitData(getInitData(window.marketPlaceData)));
    handleHistory();
    render(store, MarketPlaceApp, document.getElementById('market-place-app'));

} else {
    store = createStore(wireReducer);
    // init data
    store.dispatch(initData(getInitData(window.marketPlaceData), getReadItems(), false));

    // init query
    const params = new URLSearchParams(window.location.search);
    store.dispatch(initParams(params));
    handleHistory();

    const navigationId = params.get('navigation');
    if (navigationId) {
        store.dispatch(toggleNavigationById(navigationId));
    }
    store.dispatch(fetchItems()).then(() =>
        render(store, WireApp, document.getElementById('market-place-app'))
    );
}

// initialize web socket listener
initWebSocket(store, pushNotification);
