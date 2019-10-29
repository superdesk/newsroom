
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import fetchMock from 'fetch-mock';

import wireApp from 'users/reducers';
import * as actions from 'users/actions';

describe('fetch actions', () => {
    let store;
    const response = [{_id: 'foo'}];

    beforeEach(() => {
        fetchMock.get('/users/search?q=', response);
        fetchMock.get('/users/search', response);
        store = createStore(wireApp, applyMiddleware(thunk));
    });

    afterEach(() => {
        fetchMock.restore();

    });

    it('can fetch users', () => {
        const promise = store.dispatch(actions.fetchUsers())
            .then(() => {
                const state = store.getState();
                expect(state.isLoading).toBe(false);
                expect(state.users).toEqual(['foo']);
                expect(state.usersById).toEqual({'foo': {_id: 'foo'}});
            });
        expect(store.getState().isLoading).toBe(true);
        return promise;
    });
});
