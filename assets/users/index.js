import { createStore, render } from 'utils';
import userReducer from './reducers';
import UsersApp from './components/UsersApp';
import { initViewData } from './actions';


const store = createStore(userReducer, 'Users');


if (window.viewData) {
    store.dispatch(initViewData(window.viewData));
}


render(store, UsersApp, document.getElementById('settings-app'));
