import { get } from 'lodash';

import { createStore, render, initWebSocket, getInitData} from '../utils';

import {getReadItems} from 'local-store';
import  AmNewsApp from './components/AmNewsApp';
import wireReducer from '../wire/reducers';
import {
    fetchItems,
    initData,
    initParams,
    pushNotification,
    setState
} from '../wire/actions';
import {
    toggleNavigation,
    toggleNavigationById,
} from '../search/actions';


const store = createStore(wireReducer);

// init data
store.dispatch(initData(getInitData(window.amNewsData), getReadItems(), false));

// init query
const params = new URLSearchParams(window.location.search);
store.dispatch(initParams(params));


// init first navigations
const firstNavigation = get(window.amNewsData, 'navigations[0]');
const navigationId = params.get('navigation');
if (navigationId) {
    store.dispatch(toggleNavigationById(navigationId));
} else if (firstNavigation && !get(window.amNewsData, 'bookmarks', false)) {
    store.dispatch(toggleNavigation(firstNavigation));
}

// handle history
window.onpopstate = function(event) {
    if (event.state) {
        store.dispatch(setState(event.state));
    }
};

// fetch items & render if there are navigations
store.dispatch(fetchItems()).then(() =>
    render(store, AmNewsApp, document.getElementById('am-news-app'))
);

// initialize web socket listener
initWebSocket(store, pushNotification);
