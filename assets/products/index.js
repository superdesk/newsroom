import { createStore, render } from 'utils';
import productReducer from './reducers';
import ProductsApp from './components/ProductsApp';
import { initViewData } from './actions';


const store = createStore(productReducer, 'Products');


if (window.viewData) {
    store.dispatch(initViewData(window.viewData));
}


render(store, ProductsApp, document.getElementById('settings-app'));
