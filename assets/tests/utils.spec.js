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
        expect(utils.wordCount({body_html: html})).toBe(2);
        expect(utils.wordCount({wordcount: 5, body_html: 'foo'})).toBe(5);
    });
});

describe('charCount', () => {
    it('can count characters in html', () => {
        const html = '<p class="foo" style="color: red">foo bar, baz</p>';
        expect(utils.characterCount({body_html: html})).toBe(12);
        expect(utils.characterCount({charcount: 15, body_html: 'foo, baz'})).toBe(15);
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

describe('html text utils', () => {
    const html = '<p>Rolling News Bulletin</p><p></p><p></p><p>Parliament (CANBERRA)</p><p>Labor is still</p>';
    const text = 'Rolling News Bulletin\nParliament (CANBERRA)\nLabor is still\n';

    it('can get text from html', () => {
        expect(utils.getTextFromHtml(html)).toBe(text);
        expect(utils.getTextFromHtml('<p>foo<br>bar</p>')).toBe('foo\nbar\n');
        expect(utils.getTextFromHtml('<p>foo<span>bar</span></p>')).toBe('foobar');
    });
});
