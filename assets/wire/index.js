import { createStore, render } from 'utils';

import wireReducer from './reducers';
import WireApp from './components/WireApp';
import { fetchItems, setQuery, setState, initData, pushNotification } from './actions';

const store = createStore(wireReducer);

if (window.wireData) {
    store.dispatch(initData(window.wireData));
}

// init query
const params = new URLSearchParams(window.location.search);
if (params.get('q')) {
    store.dispatch(setQuery(params.get('q')));
}

// handle history
window.onpopstate = function(event) {
    store.dispatch(setState(event.state));
};

// fetch items & render
store.dispatch(fetchItems()).then(() =>
    render(store, WireApp, document.getElementById('wire-app'))
);

if (window.newsroom) {
    const ws = new WebSocket(window.newsroom.websocket);
    ws.onmessage = (message) => {
        const data = JSON.parse(message.data);
        if (data.event) {
            store.dispatch(pushNotification(data));
        }
    };
}
