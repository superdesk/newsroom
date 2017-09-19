
import server from 'server';
import { createStore } from 'utils';

import wireApp from '../reducers';
import * as actions from '../actions';

describe('actions', () => {
    let store;

    beforeEach(() => {
        store = createStore(wireApp, false);
    });

    it('can fetch items', () => {
        spyOn(server, 'get').and.returnValue(Promise.resolve({}));
        store.dispatch(actions.fetchItems());
        expect(server.get).toHaveBeenCalledWith('/search?q=');
    });

    it('can fetch items using query', () => {
        spyOn(server, 'get').and.returnValue(Promise.resolve({}));
        store.dispatch(actions.setQuery('foo'));
        store.dispatch(actions.fetchItems());
        expect(server.get).toHaveBeenCalledWith('/search?q=foo');
        expect(store.getState().activeQuery).toBe('foo');
    });
});
