import {gettext} from '../utils';

export const userTypes = [
    {value: 'administrator', text: gettext('Administrator')},
    {value: 'internal', text: gettext('Internal')},
    {value: 'public', text: gettext('Public')},
    {value: 'account_management', text: gettext('Account Management')},
];

export function getUserLabel(code) {
    return (userTypes.find(c => c.value === code) || {}).text;
}
