import {gettext} from '../utils';
import {get} from 'lodash';

export const userTypes = [
    {value: 'administrator', text: gettext('Administrator')},
    {value: 'internal', text: gettext('Internal')},
    {value: 'public', text: gettext('Public')},
    {value: 'account_management', text: gettext('Account Management')},
];

export function getUserLabel(code) {
    return (userTypes.find(c => c.value === code) || {}).text;
}

export function isUserAdmin(user) {
    return get(user, 'user_type') === 'administrator';
}