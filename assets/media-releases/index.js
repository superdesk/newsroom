import { createStore, render, initWebSocket, getInitData, closeItemOnMobile, isMobilePhone } from '../utils';

import {getReadItems} from 'local-store';
import WireApp from '../wire/components/WireApp';
import wireReducer from '../wire/reducers';
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


const store = createStore(wireReducer, 'MediaReleases');

// init data
store.dispatch(initData(getInitData(window.mediaReleasesData), getReadItems(), false));

// init query
const params = new URLSearchParams(window.location.search);
store.dispatch(initParams(params));

// handle history
window.onpopstate = function(event) {
    if (event.state) {
        closeItemOnMobile(store.dispatch, event.state, openItemDetails, previewItem);
        if (!isMobilePhone()) {
            store.dispatch(setState(event.state));
        }
    }
};

// init view
if (localStorage.getItem('view')) {
    store.dispatch(setView(localStorage.getItem('view')));
}

const navigationId = params.get('navigation');
if (navigationId) {
    store.dispatch(toggleNavigationById(navigationId));
}

// fetch items & render if there are navigations
store.dispatch(fetchItems()).then(() =>
    render(store, WireApp, document.getElementById('media-releases-app'))
);

// initialize web socket listener
initWebSocket(store, pushNotification);
