import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate } from '../../../utils';


function UserListItem({user, isActive, onClick, companiesById}) {
    return (
        <tr key={user._id}
            className={isActive?'table-success':null}
            onClick={() => onClick(user._id)}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.phone}</td>
            <td>{user.user_type}</td>
            <td>{(user.company && companiesById ? companiesById[user.company].name : null)}</td>
            <td>{(user.is_approved ? gettext('Approved') : gettext('Needs Approval'))} -
                {(user.is_enabled ? gettext('Enabled') : gettext('Disabled'))}</td>
            <td>{shortDate(user._created)}</td>
            <td>
                <button className="btn btn-sm delete-user"> {gettext('delete')}</button>
            </td>
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
