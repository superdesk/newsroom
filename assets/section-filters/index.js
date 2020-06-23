import { createStore, render } from 'utils';
import sectionFiltersReducer from './reducers';
import SectionFiltersApp from './components/SectionFiltersApp';
import { initViewData } from './actions';


const store = createStore(sectionFiltersReducer, 'SectionFilters');


if (window.viewData) {
    store.dispatch(initViewData(window.viewData));
}


render(store, SectionFiltersApp, document.getElementById('settings-app'));
