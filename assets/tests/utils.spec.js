import {
    gettext,
} from 'utils';

describe('gettext', () => {
    it('can translate text', () => {
        expect(gettext('foo')).toBe('foo');
    });

    it('can use params', () => {
        expect(gettext('hello {{ name }}', {name: 'john'})).toBe('hello john');
    });
});
