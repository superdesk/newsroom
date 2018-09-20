import {bem} from './utils';

describe('utils', () => {
    describe('bem', () => {
        it('handles object modifier', () => {
            expect(bem('b', null, {foo: 1, bar: 1, baz: 0})).toBe('b b--foo b--bar');
        });

        it('handles string modifier', () => {
            expect(bem('b', 'e', 'foo')).toBe('b__e b__e--foo');
        });

        it('handles empty block or element', () => {
            expect(bem('b', null, 'foo')).toBe('b b--foo');
            expect(bem(null, 'e', 'foo')).toBe('e e--foo');
            expect(bem('b', 'e', 'foo')).toBe('b__e b__e--foo');
        });
    });
});