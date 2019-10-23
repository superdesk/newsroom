import { createStore, render, initWebSocket, getInitData, closeItemOnMobile, isMobilePhone } from '../utils';

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
    setState,
    openItemDetails,
    previewItem,
} from '../wire/actions';

import {
    toggleNavigationById,
    setView,
} from 'search/actions';

import {
    initData as homeInitData
} from './actions';

const handleHistory = () => {
    // handle history
    window.onpopstate = function(event) {
        if (event.state) {
            closeItemOnMobile(store.dispatch, event.state, openItemDetails, previewItem);
            if (!isMobilePhone()) {
                store.dispatch(setState(event.state));
            }
        }
    };
};

let store;

if (window.marketPlaceData.home_page) {
    store = createStore(marketPlaceHomeReducer, 'aapX');
    store.dispatch(homeInitData(getInitData(window.marketPlaceData)));
    handleHistory();
    render(store, MarketPlaceApp, document.getElementById('market-place-app'));

} else {
    store = createStore(wireReducer, 'MarketPlace');
    // init data
    store.dispatch(initData(getInitData(window.marketPlaceData), getReadItems(), false));

    // init query
    const params = new URLSearchParams(window.location.search);
    store.dispatch(initParams(params));
    handleHistory();

    // init view
    if (localStorage.getItem('view')) {
        store.dispatch(setView(localStorage.getItem('view')));
    }

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
