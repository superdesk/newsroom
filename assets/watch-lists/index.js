import { createStore, render } from 'utils';
import userReducer from './reducers';
import WatchListApp from './components/WatchListApp';
import { initViewData, fetchWatchLists } from './actions';


const store = createStore(userReducer);


if (window.viewData) {
    store.dispatch(initViewData(window.viewData));
    store.dispatch(fetchWatchLists());
}


render(store, WatchListApp, document.getElementById('settings-app'));
