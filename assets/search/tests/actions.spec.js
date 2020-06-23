import thunk from 'redux-thunk';
import {createStore, applyMiddleware} from 'redux';

import wireReducer from 'wire/reducers';
import {initData} from 'wire/actions';
import * as actions from '../actions';
import * as selectors from '../selectors';

describe('search actions', () => {
    let store;
    let params;

    const updateParams = (search) => {
        params = {
            state: store.getState(),
            url: new URLSearchParams(search != null ? search : window.location.search),
        };
    };

    beforeEach(() => {
        history.pushState({}, null, ''); // reset window.location.search
        store = createStore(wireReducer, applyMiddleware(thunk));
        updateParams('');
    });

    it('setQuery', () => {
        expect(selectors.searchQuerySelector(params.state)).toEqual(null);
        expect(params.url.get('q')).toEqual(null);

        store.dispatch(actions.setQuery('search something'));
        updateParams();
        expect(selectors.searchQuerySelector(params.state)).toEqual('search something');
        expect(params.url.get('q')).toEqual('search something');
    });

    it('toggleFilter', () => {
        expect(selectors.searchFilterSelector(params.state)).toEqual({});
        expect(params.url.get('filter')).toEqual(null);

        store.dispatch(actions.toggleFilter('service', 'serv1'));
        updateParams();
        expect(selectors.searchFilterSelector(params.state)).toEqual({service: ['serv1']});
        expect(params.url.get('filter')).toEqual('{"service":["serv1"]}');

        store.dispatch(actions.toggleFilter('service', 'serv2'));
        updateParams();
        expect(selectors.searchFilterSelector(params.state)).toEqual({service: ['serv1', 'serv2']});
        expect(params.url.get('filter')).toEqual('{"service":["serv1","serv2"]}');

        store.dispatch(actions.toggleFilter('service', 'serv1'));
        updateParams();
        expect(selectors.searchFilterSelector(params.state)).toEqual({service: ['serv2']});
        expect(params.url.get('filter')).toEqual('{"service":["serv2"]}');

        store.dispatch(actions.toggleFilter('service', 'serv2'));
        updateParams();
        expect(selectors.searchFilterSelector(params.state)).toEqual({});
        expect(params.url.get('filter')).toEqual('{}');
    });

    it('setCreated', () => {
        expect(selectors.searchCreatedSelector(params.state)).toEqual({});
        expect(params.url.get('created')).toEqual(null);

        store.dispatch(actions.setCreatedFilter({from: 'now/M'}));
        updateParams();
        expect(selectors.searchCreatedSelector(params.state)).toEqual({from: 'now/M'});
        expect(params.url.get('created')).toEqual('{"from":"now/M"}');
    });

    describe('toggleNavigation', () => {
        it('single navigation', () => {
            expect(selectors.searchNavigationSelector(params.state)).toEqual([]);
            expect(params.url.get('navigation')).toEqual(null);

            store.dispatch(actions.toggleNavigation({_id: 'nav1'}));
            updateParams();
            expect(selectors.searchNavigationSelector(params.state)).toEqual(['nav1']);
            expect(params.url.get('navigation')).toEqual('["nav1"]');

            store.dispatch(actions.toggleNavigation({_id: 'nav2'}));
            updateParams();
            expect(selectors.searchNavigationSelector(params.state)).toEqual(['nav2']);
            expect(params.url.get('navigation')).toEqual('["nav2"]');

            store.dispatch(actions.toggleNavigation({_id: 'nav2'}));
            updateParams();
            expect(selectors.searchNavigationSelector(params.state)).toEqual([]);
            expect(params.url.get('navigation')).toEqual(null);
        });

        it('multi navigations', () => {
            store.dispatch(initData({ui_config: {multi_select_topics: true}}));

            expect(selectors.searchNavigationSelector(params.state)).toEqual([]);
            expect(params.url.get('navigation')).toEqual(null);

            store.dispatch(actions.toggleNavigation({_id: 'nav1'}));
            updateParams();
            expect(selectors.searchNavigationSelector(params.state)).toEqual(['nav1']);
            expect(params.url.get('navigation')).toEqual('["nav1"]');

            store.dispatch(actions.toggleNavigation({_id: 'nav2'}));
            updateParams();
            expect(selectors.searchNavigationSelector(params.state)).toEqual(['nav1', 'nav2']);
            expect(params.url.get('navigation')).toEqual('["nav1","nav2"]');

            store.dispatch(actions.toggleNavigation({_id: 'nav1'}));
            updateParams();
            expect(selectors.searchNavigationSelector(params.state)).toEqual(['nav2']);
            expect(params.url.get('navigation')).toEqual('["nav2"]');

            store.dispatch(actions.toggleNavigation({_id: 'nav2'}));
            updateParams();
            expect(selectors.searchNavigationSelector(params.state)).toEqual([]);
            expect(params.url.get('navigation')).toEqual(null);
        });

        it('deselect all navigations', () => {
            store.dispatch(initData({ui_config: {multi_select_topics: true}}));

            store.dispatch(actions.toggleNavigation({_id: 'nav1'}));
            store.dispatch(actions.toggleNavigation({_id: 'nav2'}));
            updateParams();
            expect(selectors.searchNavigationSelector(params.state)).toEqual(['nav1', 'nav2']);
            expect(params.url.get('navigation')).toEqual('["nav1","nav2"]');

            store.dispatch(actions.toggleNavigation());
            updateParams();
            expect(selectors.searchNavigationSelector(params.state)).toEqual([]);
            expect(params.url.get('navigation')).toEqual(null);
        });

        it('resets current search params', () => {
            store.dispatch(initData({ui_config: {multi_select_topics: true}}));
            store.dispatch(actions.toggleNavigation('nav1'));
            store.dispatch(actions.toggleNavigation('nav2'));
            store.dispatch(actions.setQuery('search something'));
            store.dispatch(actions.toggleFilter('service', 'serv1'));
            store.dispatch(actions.setCreatedFilter({from: 'now/M'}));

            updateParams();
            expect(selectors.searchNavigationSelector(params.state)).toEqual(['nav1', 'nav2']);
            expect(params.url.get('navigation')).toEqual('["nav1","nav2"]');
            expect(selectors.searchQuerySelector(params.state)).toEqual('search something');
            expect(params.url.get('q')).toEqual('search something');
            expect(selectors.searchFilterSelector(params.state)).toEqual({service: ['serv1']});
            expect(params.url.get('filter')).toEqual('{"service":["serv1"]}');
            expect(selectors.searchCreatedSelector(params.state)).toEqual({from: 'now/M'});
            expect(params.url.get('created')).toEqual('{"from":"now/M"}');

            store.dispatch(actions.toggleNavigation());
            updateParams();
            expect(selectors.searchNavigationSelector(params.state)).toEqual([]);
            expect(params.url.get('navigation')).toEqual(null);
            expect(selectors.searchQuerySelector(params.state)).toEqual(null);
            expect(params.url.get('q')).toEqual(null);
            expect(selectors.searchFilterSelector(params.state)).toEqual({});
            expect(params.url.get('filter')).toEqual(null);
            expect(selectors.searchCreatedSelector(params.state)).toEqual({});
            expect(params.url.get('created')).toEqual(null);
        });
    });

    it('resetFilter', () => {
        store.dispatch(initData({ui_config: {multi_select_topics: true}}));
        store.dispatch(actions.toggleFilter('service', 'serv1'));
        store.dispatch(actions.setCreatedFilter({from: 'now/M'}));

        updateParams();
        expect(selectors.searchFilterSelector(params.state)).toEqual({service: ['serv1']});
        expect(params.url.get('filter')).toEqual('{"service":["serv1"]}');
        expect(selectors.searchCreatedSelector(params.state)).toEqual({from: 'now/M'});
        expect(params.url.get('created')).toEqual('{"from":"now/M"}');

        store.dispatch(actions.resetFilter());
        updateParams();
        expect(selectors.searchFilterSelector(params.state)).toEqual({});
        expect(params.url.get('filter')).toEqual(null);
        expect(selectors.searchCreatedSelector(params.state)).toEqual({});
        expect(params.url.get('created')).toEqual(null);
    });

    it('loadMyTopic', () => {
        store.dispatch(initData({
            ui_config: {multi_select_topics: true},
            topics: [{
                _id: 'topic1',
                created: {from: 'now/M'},
                query: 'search something',
                filter: {service: ['serv1', 'serv2']},
                navigation: ['nav1', 'nav2'],
            }],
        }));

        updateParams();
        expect(selectors.searchTopicIdSelector(params.state)).toEqual(null);
        expect(params.url.get('topic')).toEqual(null);

        store.dispatch(actions.loadMyTopic('topic1'));
        updateParams();
        expect(selectors.searchTopicIdSelector(params.state)).toEqual('topic1');
        expect(params.url.get('topic')).toEqual('topic1');
        expect(selectors.searchNavigationSelector(params.state)).toEqual(['nav1', 'nav2']);
        expect(params.url.get('navigation')).toEqual(null);
        expect(selectors.searchQuerySelector(params.state)).toEqual('search something');
        expect(params.url.get('q')).toEqual(null);
        expect(selectors.searchFilterSelector(params.state)).toEqual({service: ['serv1', 'serv2']});
        expect(params.url.get('filter')).toEqual(null);
        expect(selectors.searchCreatedSelector(params.state)).toEqual({from: 'now/M'});
        expect(params.url.get('created')).toEqual(null);
    });

    it('initParams', () => {
        store.dispatch(initData({
            ui_config: {multi_select_topics: true},
            topics: [{
                _id: 'topic1',
                created: {from: 'now/M'},
                query: 'search something',
                filter: {service: ['serv1', 'serv2']},
                navigation: ['nav1', 'nav2'],
            }],
        }));

        params.url = new URLSearchParams({topic: 'topic1'});
        store.dispatch(actions.initParams(params.url));
        updateParams();
        expect(selectors.searchTopicIdSelector(params.state)).toEqual('topic1');
        expect(selectors.searchNavigationSelector(params.state)).toEqual(['nav1', 'nav2']);
        expect(selectors.searchQuerySelector(params.state)).toEqual('search something');
        expect(selectors.searchFilterSelector(params.state)).toEqual({service: ['serv1', 'serv2']});
        expect(selectors.searchCreatedSelector(params.state)).toEqual({from: 'now/M'});

        params.url = new URLSearchParams({
            topic: 'topic1',
            navigation: '["nav3","nav4"]',
            q: 'search different',
            filter: '{"service":["serv3","serv4"]}',
            created: '{"to":"now/W"}',
        });

        store.dispatch(actions.toggleNavigation());
        store.dispatch(actions.initParams(params.url));
        updateParams();
        expect(selectors.searchTopicIdSelector(params.state)).toEqual('topic1');
        expect(selectors.searchNavigationSelector(params.state)).toEqual(['nav3', 'nav4']);
        expect(selectors.searchQuerySelector(params.state)).toEqual('search different');
        expect(selectors.searchFilterSelector(params.state)).toEqual({service: ['serv3', 'serv4']});
        expect(selectors.searchCreatedSelector(params.state)).toEqual({to: 'now/W'});
    });
});
