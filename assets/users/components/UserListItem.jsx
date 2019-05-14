import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate, fullDate } from 'utils';
import {getUserLabel} from '../utils';
import {get} from 'lodash';


function UserListItem({user, isActive, onClick, companiesById}) {
    return (
        <tr key={user._id}
            className={`${isActive?'table--selected':''}
            ${(user.company && companiesById[user.company] && !get(companiesById[user.company],'is_enabled')) ||
            !user.is_enabled?'table-secondary':null}`}
            onClick={() => onClick(user._id)}>
            <td className="name">{user.first_name} {user.last_name}</td>
            <td>{user.email}</td>
            <td>{user.phone}</td>
            <td>{user.mobile}</td>
            <td>{user.role}</td>
            <td>{getUserLabel(user.user_type)}</td>
            <td>{(user.company && companiesById ? get(companiesById[user.company],'name') : null)}</td>
            <td>{(user.is_approved ? gettext('Approved') : gettext('Needs Approval'))} -
                {(user.is_enabled ? gettext('Enabled') : gettext('Disabled'))}</td>
            <td>{shortDate(user._created)}</td>
            <td>{get(user, 'last_active') ? fullDate(get(user, 'last_active')) : ''}</td>
        </tr>
    );
}

UserListItem.propTypes = {
    user: PropTypes.object,
    isActive: PropTypes.bool,
    onClick: PropTypes.func,
    companiesById: PropTypes.object,
};

export default UserListItem;
