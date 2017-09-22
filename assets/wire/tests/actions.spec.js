
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import fetchMock from 'fetch-mock';

import wireApp from '../reducers';
import * as actions from '../actions';

describe('fetch actions', () => {
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
        return store.dispatch(actions.fetchItems())
            .then(() => {
                const state = store.getState();
                expect(state.isLoading).toBe(false);
                expect(state.items).toEqual(['foo']);
            });
    });

    it('can fetch items using query', () => {
        store.dispatch(actions.setQuery('foo'));
        return store.dispatch(actions.fetchItems())
            .then(() => {
                const state = store.getState();
                expect(state.activeQuery).toBe('foo');
            });
    });
});
