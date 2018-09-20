import {isEmpty} from 'lodash';
import classNames from 'classnames';

const isNotEmpty = (x) => !isEmpty(x);

/**
 * Get bem classes
 *
 * @param {String} block 
 * @param {String} element 
 * @param {Object} modifier 
 * @return {String}
 */
export function bem(block, element, modifier) {
    const main = [block, element].filter(isNotEmpty).join('__');
    const classes = [main];

    if (!isEmpty(modifier)) {
        const modifiers = classNames(modifier).split(' ');

        modifiers.forEach((suffix) => {
            classes.push(main + '--' + suffix);
        });
    }

    return classes.join(' ');
}