
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import fetchMock from 'fetch-mock';

import wireApp from '../reducers';
import * as actions from '../actions';
import { now } from 'utils';

describe('wire actions', () => {
    let store;
    const response = {
        _meta: {total: 2},
        _items: [{_id: 'foo'}],
    };

    beforeEach(() => {
        now.getTimezoneOffset = () => ''; // it doesn't work with jasmine.createSpy :/
        fetchMock.get('/search?', response);
        fetchMock.get('/search?q=foo', response);
        store = createStore(wireApp, applyMiddleware(thunk));
    });

    afterEach(() => {
        fetchMock.restore();
    });

    it('test now.getTimezoneOffset mock', () => {
        expect(now.getTimezoneOffset()).toBe('');
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
        store.dispatch(actions.setQuery('foo'));
        return store.dispatch(actions.fetchItems())
            .then(() => {
                const state = store.getState();
                expect(state.activeQuery).toBe('foo');
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
        fetchMock.post('/wire_bookmark', {});
        fetchMock.delete('/wire_bookmark', {});

        store.dispatch(actions.bookmarkItems(['foo', 'bar']));
        expect(fetchMock.called('/wire_bookmark')).toBeTruthy();
        fetchMock.reset();

        store.dispatch(actions.removeBookmarks('foo'));
        expect(fetchMock.called('/wire_bookmark')).toBeTruthy();
    });

    it('can populate new items on update notification', () => {
        expect(store.getState().newItems.length).toBe(0);
        store.dispatch(actions.pushNotification({
            event: 'update', extra: {topics: [1], item:{'_id': 'a'}}}));
        expect(store.getState().newItems.length).toBe(1);
        expect(store.getState().newItemsByTopic[1].length).toBe(1);
    });

    it('can open item', () => {
        store.dispatch(actions.openItem({_id: 'foo'}));
        expect(store.getState().openItem._id).toBe('foo');
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
        fetchMock.get('/search?from=1', {_items: [{_id: 'bar'}]});
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
        fetchMock.get('/search?service={"foo":true}', {_items: [{_id: 'foo'}]});
        return store.dispatch(actions.toggleService({code: 'foo'}))
            .then(() => {
                expect(store.getState().wire.activeService).toEqual({'foo': true});
                return store.dispatch(actions.toggleService({code: 'foo'}));
            })
            .then(() => {
                expect(store.getState().wire.activeService).toEqual({'foo': false});
                return store.dispatch(actions.toggleService());
            })
            .then(() => {
                expect(store.getState().wire.activeService).toEqual({});
            });
    });
});
