import { keyBy } from 'lodash';
import * as utils from '../utils';


describe('utils', () => {
    describe('groupItems', () => {
        it('returns grouped items per day', () => {
            const items = [
                {
                    _id: 'foo',
                    dates: {start: '2018-10-15T04:00:00+0000', end: '2018-10-15T05:00:00+0000', tz: 'Australia/Sydney'},
                    event: {_id: 'foo'}
                },
                {
                    _id: 'bar',
                    dates: {start: '2018-10-18T06:00:00+0000', end: '2018-10-18T09:00:00+0000', tz: 'Australia/Sydney'},
                    event: {_id: 'bar'}
                },
            ];

            const groupedItems = keyBy(utils.groupItems(items, '2018-10-13', 'day'), 'date');

            expect(groupedItems.hasOwnProperty('13-10-2018')).toBe(false);
            expect(groupedItems.hasOwnProperty('14-10-2018')).toBe(false);
            expect(groupedItems['15-10-2018']['items']).toEqual(['foo']);
            expect(groupedItems.hasOwnProperty('16-10-2018')).toBe(false);
            expect(groupedItems.hasOwnProperty('17-10-2018')).toBe(false);
            expect(groupedItems['18-10-2018']['items']).toEqual(['bar']);
        });

        it('returns grouped multi day events per day', () => {
            const items = [
                {
                    _id: 'foo',
                    dates: {start: '2018-10-15T04:00:00+0000', end: '2018-10-17T05:00:00+0000', tz: 'Australia/Sydney'},
                    event: {_id: 'foo'}
                },
                {
                    _id: 'bar',
                    dates: {start: '2018-10-17T06:00:00+0000', end: '2018-10-18T09:00:00+0000', tz: 'Australia/Sydney'},
                    event: {_id: 'bar'}
                },
            ];

            const groupedItems = keyBy(utils.groupItems(items, '2018-10-16', 'day'), 'date');

            expect(groupedItems.hasOwnProperty('15-10-2018')).toBe(false);
            expect(groupedItems['16-10-2018']['items']).toEqual(['foo']);
            expect(groupedItems['17-10-2018']['items']).toEqual(['foo', 'bar']);
            expect(groupedItems['18-10-2018']['items']).toEqual(['bar']);
            expect(groupedItems.hasOwnProperty('19-10-2018')).toBe(false);
        });

        it('returns grouped events with extra days per day', () => {
            const items = [
                {
                    _id: 'foo',
                    dates: {start: '2018-10-15T04:00:00+0000', end: '2018-10-17T05:00:00+0000', tz: 'Australia/Sydney'},
                    display_dates: [{date: '2018-10-13T10:00:00+0000'}],
                    event: {_id: 'foo'}
                }];

            const groupedItems = keyBy(utils.groupItems(items, '2018-10-11', 'day'), 'date');

            expect(groupedItems.hasOwnProperty('11-10-2018')).toBe(false);
            expect(groupedItems.hasOwnProperty('12-10-2018')).toBe(false);
            expect(groupedItems['13-10-2018']['items']).toEqual(['foo']);
            expect(groupedItems.hasOwnProperty('14-10-2018')).toBe(false);
            expect(groupedItems['15-10-2018']['items']).toEqual(['foo']);
            expect(groupedItems['16-10-2018']['items']).toEqual(['foo']);
            expect(groupedItems['17-10-2018']['items']).toEqual(['foo']);
            expect(groupedItems.hasOwnProperty('18-10-2018')).toBe(false);
        });

        it('returns grouped ad-hoc plan based on extra days', () => {
            const items = [
                {
                    _id: 'foo',
                    dates: {start: '2018-10-17T04:00:00+0000', end: '2018-10-17T04:00:00+0000'},
                    display_dates: [
                        {date: '2018-10-16T04:00:00+0000'},
                        {date: '2018-10-18T04:00:00+0000'}
                    ],
                    event: null
                }];

            const groupedItems = keyBy(utils.groupItems(items, '2018-10-15', 'day'), 'date');

            expect(groupedItems.hasOwnProperty('15-10-2018')).toBe(false);
            expect(groupedItems.hasOwnProperty('17-10-2018')).toBe(false);
            expect(groupedItems.hasOwnProperty('16-10-2018')).toBe(true);
            expect(groupedItems.hasOwnProperty('18-10-2018')).toBe(true);
            expect(groupedItems['16-10-2018']['items']).toEqual(['foo']);
            expect(groupedItems['18-10-2018']['items']).toEqual(['foo']);
        });

        it('returns grouped ad-hoc plan with no extra days', () => {
            const items = [
                {
                    _id: 'foo',
                    dates: {start: '2018-10-17T04:00:00+0000', end: '2018-10-17T04:00:00+0000'},
                    display_dates: [{date: '2018-10-17T04:00:00+0000'}],
                    event: null
                }];

            const groupedItems = keyBy(utils.groupItems(items, '2018-10-15', 'day'), 'date');

            expect(groupedItems.hasOwnProperty('15-10-2018')).toBe(false);
            expect(groupedItems.hasOwnProperty('16-10-2018')).toBe(false);
            expect(groupedItems.hasOwnProperty('17-10-2018')).toBe(true);
            expect(groupedItems.hasOwnProperty('18-10-2018')).toBe(false);
            expect(groupedItems['17-10-2018']['items']).toEqual(['foo']);
        });
    });

    describe('listItems', () => {
        it('of event with planning items', () => {
            const items = [
                {
                    _id: 'foo',
                    dates: {start: '2018-10-15T04:00:00+0000', end: '2018-10-15T05:00:00+0000', tz: 'Australia/Sydney'},
                    display_dates: [
                        {date: '2018-10-14T04:00:00+0000'},
                        {date: '2018-10-16T04:00:00+0000'},
                    ],
                    event: {_id: 'foo'},
                    coverages: [
                        {
                            'scheduled': '2018-10-15T04:00:00+0000',
                            'planning_id': 'plan1',
                            'coverage_id': 'coverage1'
                        },
                        {
                            'scheduled': '2018-10-14T04:00:00+0000',
                            'planning_id': 'plan1',
                            'coverage_id': 'coverage2'
                        },
                        {
                            'scheduled': '2018-10-16T04:00:00+0000',
                            'planning_id': 'plan2',
                            'coverage_id': 'coverage3'
                        }
                    ],
                    planning_items: [
                        {
                            '_id': 'plan1',
                            'guid': 'plan1',
                            'planning_date': '2018-10-15T04:30:00+0000',
                            'coverages': [
                                {
                                    'scheduled': '2018-10-15T04:00:00+0000',
                                    'planning_id': 'plan1',
                                    'coverage_id': 'coverage1'
                                },
                                {
                                    'scheduled': '2018-10-14T04:00:00+0000',
                                    'planning_id': 'plan1',
                                    'coverage_id': 'coverage2'
                                }
                            ],
                        },
                        {
                            '_id': 'plan2',
                            'guid': 'plan2',
                            'planning_date': '2018-10-15T04:30:00+0000',
                            'coverages': [{
                                'scheduled': '2018-10-16T04:00:00+0000',
                                'planning_id': 'plan2',
                                'coverage_id': 'coverage3'
                            }],
                        }
                    ]
                }
            ];

            const groupedItems = utils.groupItems(items, '2018-10-11', 'day');
            const itemsById = keyBy(items, '_id');
            const listItems = keyBy(utils.getListItems(groupedItems, itemsById), 'group');

            expect(groupedItems.hasOwnProperty('11-10-2018')).toBe(false);
            expect(groupedItems.hasOwnProperty('12-10-2018')).toBe(false);
            expect(groupedItems.hasOwnProperty('13-10-2018')).toBe(false);
            expect(listItems.hasOwnProperty('14-10-2018')).toBe(true);
            expect(listItems.hasOwnProperty('15-10-2018')).toBe(true);
            expect(listItems.hasOwnProperty('16-10-2018')).toBe(true);
            expect(listItems['14-10-2018']['_id']).toBe('foo');
            expect(listItems['14-10-2018']['plan']['guid']).toBe('plan1');
            expect(listItems['15-10-2018']['_id']).toBe('foo');
            expect(listItems['15-10-2018']['plan']['guid']).toBe('plan1');
            expect(listItems['16-10-2018']['_id']).toBe('foo');
            expect(listItems['16-10-2018']['plan']['guid']).toBe('plan2');
        });

        it('planning items without coverages associated with event are also displayed', () => {
            const items = [
                {
                    _id: 'foo',
                    dates: {start: '2018-10-15T04:00:00+0000', end: '2018-10-15T05:00:00+0000', tz: 'Australia/Sydney'},
                    display_dates: [{date: '2018-10-14T04:00:00+0000'}],
                    event: {_id: 'foo'},
                    coverages: [],
                    planning_items: [
                        {
                            '_id': 'plan1',
                            'guid': 'plan1',
                            'planning_date': '2018-10-14T04:30:00+0000',
                        }
                    ]
                }
            ];

            const groupedItems = utils.groupItems(items, '2018-10-11', 'day');
            const itemsById = keyBy(items, '_id');
            const listItems = keyBy(utils.getListItems(groupedItems, itemsById), 'group');

            expect(groupedItems.hasOwnProperty('11-10-2018')).toBe(false);
            expect(groupedItems.hasOwnProperty('12-10-2018')).toBe(false);
            expect(groupedItems.hasOwnProperty('13-10-2018')).toBe(false);
            expect(listItems.hasOwnProperty('14-10-2018')).toBe(true);
            expect(listItems['14-10-2018']['_id']).toBe('foo');
            expect(listItems['14-10-2018']['plan']['guid']).toBe('plan1');
        });
    });
});
