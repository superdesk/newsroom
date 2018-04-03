import { createStore, render } from 'utils';
import userReducer from './reducers';
import UserProfileApp from './components/UserProfileApp';
import {initData, selectMenu} from './actions';


const store = createStore(userReducer);


if (window.profileData) {
    store.dispatch(initData(window.profileData));
}

render(
    store,
    UserProfileApp,
    document.getElementById('header-profile-toggle')
);


document.addEventListener('manage_topics', function () {
    store.dispatch(selectMenu('topics'));
}, false);