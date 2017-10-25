
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import fetchMock from 'fetch-mock';

import wireApp from '../reducers';
import * as actions from '../actions';

describe('wire actions', () => {
    let store;
    const response = {
        _meta: {total: 1},
        _items: [{_id: 'foo'}],
    };

    beforeEach(() => {
        fetchMock.get('/search?q=', response);
        fetchMock.get('/search?q=foo', response);
        store = createStore(wireApp, applyMiddleware(thunk));
    });

    afterEach(() => {
        fetchMock.restore();
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
        expect(store.getState().newItemsCount).toBe(0);
        return store.dispatch(actions.pushNotification({event: 'update'}))
            .then(() => {
                expect(fetchMock.called('/search?q=')).toBeTruthy();
                expect(store.getState().newItemsCount).toBe(1);
                store.dispatch(actions.refreshItems());
                expect(store.getState().newItemsCount).toBe(0);
                expect(store.getState().items.length).toBe(1);
            });
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
                expect(versions[0]._id).toBe('baz');
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
});
