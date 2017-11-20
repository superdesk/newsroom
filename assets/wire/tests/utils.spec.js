import * as utils from '../utils';

describe('shortText', () => {
    const html = '<p>Rolling News Bulletin</p><p></p><p></p><p>Parliament (CANBERRA)</p><p>Labor is still</p>';
    const text = 'Rolling News Bulletin Parliament (CANBERRA) Labor is still';

    it('can get short text for html', () => {
        expect(utils.shortText({body_html: html})).toBe(text);
    });
});
