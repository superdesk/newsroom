import { createStore, render } from 'utils';

import wireReducer from './reducers';
import WireApp from './components/WireApp';
import { fetchItems, setQuery, setState } from './actions';

const store = createStore(wireReducer);

// init query
const params = new URLSearchParams(window.location.search);
if (params.get('q')) {
    store.dispatch(setQuery(params.get('q')));
}

// handle history
window.onpopstate = function(event) {
    store.dispatch(setState(event.state));
};

// init data
store.dispatch(fetchItems()).then(() =>
    render(store, WireApp, document.getElementById('wire-app'))
);
