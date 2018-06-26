import * as utils from '../utils';

describe('utils', () => {
    const html = '<p>Rolling News Bulletin</p><p></p><p></p><p>Parliament (CANBERRA)</p><p>Labor is still</p>';
    const text = 'Rolling News Bulletin Parliament (CANBERRA) Labor is still';

    it('can get short text for html', () => {
        expect(utils.shortText({body_html: html})).toBe(text);
    });

    it('can get caption for picture', () => {
        expect(utils.getCaption({body_text: '<p>foo bar</p>'})).toBe('foo bar');
        expect(utils.getCaption({description_text: 'baz'})).toBe('baz');
    });

    it('can get picture from body if featured is not set', () => {
        const embed = {guid: 'embed', type: 'picture'};
        const item = {
            associations: {
                embed123: embed,
            },
        };

        expect(utils.getPicture(item)).toBe(embed);
    });
});
