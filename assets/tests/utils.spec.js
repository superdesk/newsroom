import * as utils from 'utils';

describe('gettext', () => {
    it('can translate text', () => {
        expect(utils.gettext('foo')).toBe('foo');
    });

    it('can use params', () => {
        expect(utils.gettext('hello {{ name }}', {name: 'john'})).toBe('hello john');
    });
});

describe('wordCount', () => {
    it('can count words in html', () => {
        const html = '<p class="foo" style="color: red">foo bar</p>';
        expect(utils.wordCount(html)).toBe(2);
    });
});

describe('toggleValue', () => {
    it('can toggle value', () => {
        const items = ['foo', 'bar'];
        expect(utils.toggleValue(items, 'foo')).toEqual(['bar']);
        expect(utils.toggleValue(items, 'baz')).toEqual(['foo', 'bar', 'baz']);
        expect(items).toEqual(['foo', 'bar']);
    });
});
