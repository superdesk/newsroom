import {defaultReducer} from 'reducers';

describe('default reducer', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            navigations: [],
            activeNavigation: null,
            activeFilter: {},
            createdFilter: {},
            activeTopic: null,
            activeView: 'compact',
            items: [],
            itemsById: {},
        };
    });

    describe('receive items', () => {
        it('items is empty', () => {
            const result = defaultReducer(initialState, {
                type: 'RECIEVE_NEXT_ITEMS',
                data: {
                    _items: [
                        {_id: 'foo'},
                        {_id: 'bar'},
                    ]
                }
            });

            expect(result.items).toEqual(['foo', 'bar']);
            expect(result.itemsById.foo).toEqual({_id: 'foo'});
            expect(result.itemsById.bar).toEqual({_id: 'bar'});
        });

        it('new items are appended', () => {
            initialState.items = ['foo', 'bar'];
            initialState.itemsById = {
                'foo': {_id: 'foo'},
                'bar': {_id: 'bar'},
            };
            const result = defaultReducer(initialState, {
                type: 'RECIEVE_NEXT_ITEMS',
                data: {
                    _items: [
                        {_id: 'foo1'},
                        {_id: 'bar1'},
                    ]
                }
            });

            expect(result.items).toEqual(['foo', 'bar', 'foo1', 'bar1']);
            expect(result.itemsById.foo).toEqual({_id: 'foo'});
            expect(result.itemsById.bar).toEqual({_id: 'bar'});
            expect(result.itemsById.foo1).toEqual({_id: 'foo1'});
            expect(result.itemsById.bar1).toEqual({_id: 'bar1'});
        });

        it('some items are already loaded', () => {
            initialState.items = ['foo', 'bar'];
            initialState.itemsById = {
                'foo': {_id: 'foo'},
                'bar': {_id: 'bar'},
                'foo1': {_id: 'foo1'},
                'bar1': {_id: 'bar1'},
            };
            const result = defaultReducer(initialState, {
                type: 'RECIEVE_NEXT_ITEMS',
                data: {
                    _items: [
                        {_id: 'foo1'},
                        {_id: 'bar1'},
                        {_id: 'bar2'},
                    ]
                }
            });

            expect(result.items).toEqual(['foo', 'bar', 'foo1', 'bar1', 'bar2']);
            expect(result.itemsById.foo).toEqual({_id: 'foo'});
            expect(result.itemsById.bar).toEqual({_id: 'bar'});
            expect(result.itemsById.foo1).toEqual({_id: 'foo1'});
            expect(result.itemsById.bar1).toEqual({_id: 'bar1'});
            expect(result.itemsById.bar2).toEqual({_id: 'bar2'});
        });
    });
});
