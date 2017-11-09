import { createStore, render } from 'utils';

import wireReducer from './reducers';
import WireApp from './components/WireApp';
import { fetchItems, setState, initData, initParams, pushNotification, setView } from './actions';

const store = createStore(wireReducer);

if (window.wireData) {
    store.dispatch(initData(window.wireData));
}

// init query
const params = new URLSearchParams(window.location.search);
store.dispatch(initParams(params));

// init view
if (localStorage.getItem('view')) {
    store.dispatch(setView(localStorage.getItem('view')));
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
