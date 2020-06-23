import {get, startsWith} from 'lodash';

import { createStore, render, getInitData, initWebSocket, closeItemOnMobile, isMobilePhone } from 'utils';
import {getReadItems} from 'local-store';
import monitoringReducer from './reducers';
import WireApp from 'wire/components/WireApp';
import MonitoringApp from './components/MonitoringApp';
import { initViewData, fetchMonitoring } from './actions';
import {
    fetchItems,
    initData,
    initParams,
    pushNotification,
    setState,
    openItemDetails,
    previewItem,
} from '../wire/actions';
import wireReducer from 'wire/reducers';
import {
    toggleNavigationById,
    setView,
    toggleNavigation,
} from 'search/actions';


let store;

if (get(window.viewData, 'context', '') === 'monitoring') {
    store = createStore(wireReducer, 'Monitoring');
    // init data
    store.dispatch(initData(getInitData(window.viewData), getReadItems(), false));

    // init query
    const params = new URLSearchParams(window.location.search);
    store.dispatch(initParams(params));
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

    // init first navigations - only if not loading a page to preview an item
    const firstNavigation = get(window.viewData, 'bookmarks') || startsWith(window.location.search, '?item=') ? null :
        get(window.viewData, 'navigations[0]');
    const navigationId = params.get('navigation');
    if (navigationId) {
        store.dispatch(toggleNavigationById(navigationId));
    } else if (firstNavigation) {
        store.dispatch(toggleNavigation(firstNavigation));
    }

    const promise = navigationId || firstNavigation ? store.dispatch(fetchItems()) : Promise.resolve();

    promise.then(() =>
        render(store, WireApp, document.getElementById('monitoring-app'),
            {
                addAllOption: false,
                disableSameNavigationDeselect: true,
            })
    );

    // initialize web socket listener
    initWebSocket(store, pushNotification);
} else {
    store = createStore(monitoringReducer, 'Monitoring');
    if (window.viewData) {
        store.dispatch(initViewData(window.viewData));
        store.dispatch(fetchMonitoring());
    }
    render(store, MonitoringApp, document.getElementById('settings-app'));
}
