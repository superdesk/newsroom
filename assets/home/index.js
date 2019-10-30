import { createStore, render, getInitData } from 'utils';
import homeReducer from './reducers';
import HomeApp from './components/HomeApp';
import {initData} from './actions';


const store = createStore(homeReducer, 'Home');


if (window.homeData) {
    store.dispatch(initData(getInitData(window.homeData)));
}

render(
    store,
    HomeApp,
    document.getElementById('home-app')
);
