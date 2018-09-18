import * as utils from '../utils';

describe('utils', () => {
    describe('groupItems', () => {
        it('returns grouped items per day', () => {
            const items = [
                {
                    _id: 'foo',
                    dates: {start: '2018-10-15T04:00:00+0000', end: '2018-10-15T05:00:00+0000', tz: 'Australia/Sydney'}
                },
                {
                    _id: 'bar',
                    dates: {start: '2018-10-18T06:00:00+0000', end: '2018-10-18T09:00:00+0000', tz: 'Australia/Sydney'}
                },
            ];

            const groupedItems = utils.groupItems(items, '2018-10-13', 'day');

            expect(groupedItems.hasOwnProperty('13-10-2018')).toBe(false);
            expect(groupedItems.hasOwnProperty('14-10-2018')).toBe(false);
            expect(groupedItems['15-10-2018']).toEqual(['foo']);
            expect(groupedItems.hasOwnProperty('16-10-2018')).toBe(false);
            expect(groupedItems.hasOwnProperty('17-10-2018')).toBe(false);
            expect(groupedItems['18-10-2018']).toEqual(['bar']);
        });

        it('returns grouped multi day events per day', () => {
            const items = [
                {
                    _id: 'foo',
                    dates: {start: '2018-10-15T04:00:00+0000', end: '2018-10-17T05:00:00+0000', tz: 'Australia/Sydney'}
                },
                {
                    _id: 'bar',
                    dates: {start: '2018-10-17T06:00:00+0000', end: '2018-10-18T09:00:00+0000', tz: 'Australia/Sydney'}
                },
            ];

            const groupedItems = utils.groupItems(items, '2018-10-16', 'day');

            expect(groupedItems.hasOwnProperty('15-10-2018')).toBe(false);
            expect(groupedItems['16-10-2018']).toEqual(['foo']);
            expect(groupedItems['17-10-2018']).toEqual(['foo', 'bar']);
            expect(groupedItems['18-10-2018']).toEqual(['bar']);
            expect(groupedItems.hasOwnProperty('19-10-2018')).toBe(false);
        });

        it('returns grouped events with extra days per day', () => {
            const items = [
                {
                    _id: 'foo',
                    dates: {start: '2018-10-15T04:00:00+0000', end: '2018-10-17T05:00:00+0000', tz: 'Australia/Sydney'},
                    display_dates: [{date: '2018-10-13T10:00:00+0000'}]
                }];

            const groupedItems = utils.groupItems(items, '2018-10-11', 'day');

            expect(groupedItems.hasOwnProperty('11-10-2018')).toBe(false);
            expect(groupedItems.hasOwnProperty('12-10-2018')).toBe(false);
            expect(groupedItems['13-10-2018']).toEqual(['foo']);
            expect(groupedItems.hasOwnProperty('14-10-2018')).toBe(false);
            expect(groupedItems['15-10-2018']).toEqual(['foo']);
            expect(groupedItems['16-10-2018']).toEqual(['foo']);
            expect(groupedItems['17-10-2018']).toEqual(['foo']);
            expect(groupedItems.hasOwnProperty('18-10-2018')).toBe(false);
        });
    });

});
