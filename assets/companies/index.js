import { createStore, render } from 'utils';
import companyReducer from './reducers';
import CompaniesApp from './components/CompaniesApp';
import { initViewData } from './actions';

const store = createStore(companyReducer, 'Company');


if (window.viewData && window.viewData.companies) {
    store.dispatch(initViewData(window.viewData));
}


render(store, CompaniesApp, document.getElementById('settings-app'));
