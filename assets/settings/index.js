import { createStore, render } from 'utils';
import userReducer from './reducers';
import SettingsApp from './components/SettingsApp';
import { fetchItems, initViewData } from './actions';


const store = createStore(userReducer);


if (window.viewData) {
    store.dispatch(initViewData(window.viewData));
}


// init companies
store.dispatch(fetchItems('companies'));


render(store, SettingsApp, document.getElementById('settings-app'));
