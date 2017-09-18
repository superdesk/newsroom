import React from 'react';
import PropTypes from 'prop-types';
import UserListItem from './UserListItem';
import { gettext } from '../../utils';


function UsersList({users, onClick, activeUserId, companiesById}) {
    const list = users.map((user) =>
        <UserListItem
            key={user._id}
            user={user}
            onClick={onClick}
            isActive={activeUserId===user._id}
            companiesById={companiesById} />
    );

    return (
        <table className="table table-responsive table-hover">
            <thead>
                <tr>
                    <th>{ gettext('Name') }</th>
                    <th>{ gettext('Email') }</th>
                    <th>{ gettext('Telephone') }</th>
                    <th>{ gettext('User Type') }</th>
                    <th>{ gettext('Company') }</th>
                    <th>{ gettext('Status') }</th>
                    <th>{ gettext('Created On') }</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>{list}</tbody>
        </table>
    );
}

UsersList.propTypes = {
    users: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired,
    activeUserId: PropTypes.string,
    companiesById: PropTypes.object,
};

export default UsersList;
