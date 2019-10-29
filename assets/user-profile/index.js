import {render, isWireContext} from 'utils';
import UserProfileApp from './components/UserProfileApp';
import {initData, selectMenu} from './actions';
import {store} from './store';

if (window.profileData) {
    store.dispatch(initData(window.profileData));
}

render(
    store,
    UserProfileApp,
    document.getElementById('header-profile-toggle')
);

document.addEventListener('manage_topics', function () {
    isWireContext() ? store.dispatch(selectMenu('topics')) : store.dispatch(selectMenu('events'));
}, false);
