import {gettext} from '../utils';

export const countries = [
    {value: 'au', text: gettext('Australia')},
    {value: 'nz', text: gettext('New Zealand')},
    {value: 'fin', text: gettext('Finland')},
    {value: 'other', text: gettext('Other')},
];

export function getCountryLabel(code) {
    return (countries.find(c => c.value === code) || {}).text;
}