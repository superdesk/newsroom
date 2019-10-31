import { createStore, render } from 'utils';
import cardReducer from './reducers';
import CardsApp from './components/CardsApp';
import { initViewData } from './actions';


const store = createStore(cardReducer, 'Cards');


if (window.viewData) {
    store.dispatch(initViewData(window.viewData));
}


render(store, CardsApp, document.getElementById('settings-app'));
