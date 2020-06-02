import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import { createStore, applyMiddleware } from 'redux';

import server from 'server';

import wireApp from '../reducers';
import * as actions from '../actions';
import * as utils from 'utils';
import {
    setQuery,
    toggleNavigation,
    toggleFilter,
    setCreatedFilter,
    loadMyTopic,
} from 'search/actions';
import {initData} from '../actions';

describe('wire actions', () => {
    let store;
    const response = {
        _meta: {total: 2},
        _items: [{_id: 'foo'}],
    };

    beforeEach(() => {
        spyOn(utils.now, 'utcOffset').and.returnValue('');
        fetchMock.get('begin:/wire/search?&tick=', response);
        fetchMock.get('begin:/wire/search?q=foo&es_highlight=1&tick=', response);
        store = createStore(wireApp, applyMiddleware(thunk));
    });

    afterEach(() => {
        fetchMock.restore();
    });

    it('test getTimezoneOffset mock', () => {
        expect(utils.getTimezoneOffset()).toBe(0);
    });

    it('can fetch items', () => {
        const promise = store.dispatch(actions.fetchItems())
            .then(() => {
                const state = store.getState();
                expect(state.isLoading).toBe(false);
                expect(state.items).toEqual(['foo']);
            });
        expect(store.getState().isLoading).toBe(true);
        return promise;
    });

    it('can fetch items using query', () => {
        store.dispatch(setQuery('foo'));
        return store.dispatch(actions.fetchItems())
            .then(() => {
                const state = store.getState();
                expect(state.search.activeQuery).toBe('foo');
            });
    });

    it('can toggle selected item', () => {
        store.dispatch(actions.setItems([{_id: 'foo'}, {_id: 'bar'}]));
        expect(store.getState().selectedItems).toEqual([]);
        store.dispatch(actions.toggleSelected('foo'));
        expect(store.getState().selectedItems).toEqual(['foo']);
        store.dispatch(actions.toggleSelected('foo'));
        expect(store.getState().selectedItems).toEqual([]);
        store.dispatch(actions.selectAll());
        expect(store.getState().selectedItems).toEqual(['foo', 'bar']);
        store.dispatch(actions.selectNone());
        expect(store.getState().selectedItems).toEqual([]);
    });

    it('can bookmark items', () => {
        store.dispatch(actions.initData({context: 'wire'}));
        fetchMock.post('/wire_bookmark', {});
        fetchMock.delete('/wire_bookmark', {});

        store.dispatch(actions.bookmarkItems(['foo', 'bar']));
        expect(fetchMock.called('/wire_bookmark')).toBeTruthy();
        fetchMock.reset();

        store.dispatch(actions.removeBookmarks('foo'));
        expect(fetchMock.called('/wire_bookmark')).toBeTruthy();
    });

    it('can populate new items on update notification by topic', () => {
        expect(store.getState().newItemsByTopic).toEqual({});
        store.dispatch(actions.pushNotification({
            event: 'topic_matches', extra: {topics: [1], item:{'_id': 'a'}}}));
        expect(store.getState().newItemsByTopic).toEqual({1: [{'_id': 'a'}]});
    });

    it('can populate new items on update', () => {
        expect(store.getState().newItems).toEqual([]);
        return store.dispatch(actions.pushNotification({event: 'new_item', extra: { _items: [ {'_id': 'foo', 'type': 'text'} ]}}))
            .then(() => {
                expect(store.getState().newItems).toEqual(['foo']);
            });
    });

    it('can filter out updated items from newItems', () => {
        store.dispatch(actions.setNewItems({
            _items: [
                {_id: 'foo', 'type': 'text'},
                {_id: 'bar', 'nextversion': 'x', 'type': 'text'},
                {_id: 'baz', 'type': 'text'}
            ]
        }));
        expect(store.getState().newItems).toEqual(['foo', 'baz']);
    });

    it('can open item', () => {
        fetchMock.post('/history/new', {});
        store.dispatch(actions.openItem({_id: 'foo'}));
        expect(store.getState().openItem._id).toBe('foo');
        expect(fetchMock.called('/history/new')).toBeTruthy();
        fetchMock.reset();
    });

    it('open item records history actions', () => {
        fetchMock.post('/history/new', {});
        spyOn(utils, 'postHistoryAction').and.callFake(function(item, action, section) {
            expect(item).toEqual({_id: 'foo'});
            expect(action).toEqual('open');
            expect(section).toEqual('wire');
        });
        store.dispatch(actions.openItem({_id: 'foo'}));
        expect(store.getState().openItem._id).toBe('foo');
        fetchMock.reset();
    });

    it('preview item records history actions', () => {
        fetchMock.post('/history/new', {});
        spyOn(utils, 'postHistoryAction').and.callFake(function(item, action, section) {
            expect(item).toEqual({_id: 'foo'});
            expect(action).toEqual('preview');
            expect(section).toEqual('wire');
        });
        store.dispatch(actions.previewItem({_id: 'foo'}));
        fetchMock.reset();
    });

    it('can fetch item previous versions', () => {
        const item = {_id: 'foo'};
        fetchMock.get(`/wire/${item._id}/versions`, {_items: [{_id: 'bar'}, {_id: 'baz'}]});

        return store.dispatch(actions.fetchVersions(item))
            .then((versions) => {
                expect(versions.length).toBe(2);
                expect(versions[0]._id).toBe('bar');
            });
    });

    it('can fetch next item version', () => {
        const item = {nextversion: 'bar'};
        const next = {};
        fetchMock.get('/wire/bar?format=json', next);

        return store.dispatch(actions.fetchNext(item))
            .then((_next) => {
                expect(_next).toEqual(next);
            });
    });

    it('can reject if item has no next version', () => {
        return store.dispatch(actions.fetchNext({})).then(() => {
            expect(true).toBe(false); // this should not be called
        }, () => {
            expect(fetchMock.called()).toBeFalsy();
        });
    });

    it('can fetch more items', (done) => {
        fetchMock.get('begin:/wire/search?from=1&tick=', {_items: [{_id: 'bar'}]});
        return store.dispatch(actions.fetchItems())
            .then(() => {
                expect(store.getState().totalItems).toBe(2);
                const promise = store.dispatch(actions.fetchMoreItems())
                    .then(() => {
                        expect(store.getState().isLoading).toBeFalsy();
                        expect(store.getState().items.length).toBe(2);
                        return store.dispatch(actions.fetchMoreItems())
                            .then(
                                () => expect(true).toBeFalsy(),  // should reject after fetching all
                                () => done()
                            );
                    });
                expect(store.getState().isLoading).toBeTruthy();
                return promise;
            });
    });

    it('can set and reset service filter', () => {
        store.dispatch(toggleNavigation({_id: 'foo'}));
        expect(store.getState().search.activeNavigation).toEqual(['foo']);
        store.dispatch(toggleNavigation({_id: 'bar'}));
        expect(store.getState().search.activeNavigation).toEqual(['bar']);
        store.dispatch(toggleNavigation());
        expect(store.getState().search.activeNavigation).toEqual([]);
    });

    describe('can search with parameters', () => {
        beforeEach(() => {
            spyOn(server, 'get');
        });

        it('can search using navigations & filters', () => {
            store.dispatch(initData({ui_config: {multi_select_topics: true}}));
            store.dispatch(toggleNavigation('nav1'));
            store.dispatch(toggleNavigation('nav2'));
            store.dispatch(setQuery('search something'));
            store.dispatch(toggleFilter('service', 'serv1'));
            store.dispatch(toggleFilter('service', 'serv2'));
            store.dispatch(setCreatedFilter({from: 'now/M'}));

            actions.search(store.getState());
            const url = server.get.calls.argsFor(0)[0];

            expect(url).toContain('q=search%20something');
            expect(url).toContain('navigation=nav1,nav2');
            expect(url).toContain('filter=%7B%22service%22%3A%5B%22serv1%22%2C%22serv2%22%5D%7D');
            expect(url).toContain('created_from=now/M&created_to=now/M');
        });

        it('can search using myTopic', () => {
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
            store.dispatch(loadMyTopic('topic1'));

            actions.search(store.getState());
            const url = server.get.calls.argsFor(0)[0];

            expect(url).toContain('q=search%20something');
            expect(url).toContain('navigation=nav1,nav2');
            expect(url).toContain('filter=%7B%22service%22%3A%5B%22serv1%22%2C%22serv2%22%5D%7D');
            expect(url).toContain('created_from=now/M&created_to=now/M');
        });
    });
});
