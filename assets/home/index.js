import {createStore, render, getInitData, initWebSocket} from 'utils';
import homeReducer from './reducers';
import HomeApp from './components/HomeApp';
import {initData, pushNotification} from './actions';


const store = createStore(homeReducer, 'Home');


if (window.homeData) {
    store.dispatch(initData(getInitData(window.homeData)));
}

render(
    store,
    HomeApp,
    document.getElementById('home-app')
);

initWebSocket(store, pushNotification);
