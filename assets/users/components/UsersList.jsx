import React from 'react';
import PropTypes from 'prop-types';
import UserListItem from './UserListItem';
import { gettext } from 'utils';


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
        <section className="content-main">
            <div className="list-items-container">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>{ gettext('Name') }</th>
                            <th>{ gettext('Email') }</th>
                            <th>{ gettext('Phone') }</th>
                            <th>{ gettext('Mobile') }</th>
                            <th>{ gettext('Role') }</th>
                            <th>{ gettext('User Type') }</th>
                            <th>{ gettext('Company') }</th>
                            <th>{ gettext('Status') }</th>
                            <th>{ gettext('Created On') }</th>
                            <th>{ gettext('Last Active') }</th>
                        </tr>
                    </thead>
                    <tbody>{list}</tbody>
                </table>
            </div>
        </section>
    );
}

UsersList.propTypes = {
    users: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired,
    activeUserId: PropTypes.string,
    companiesById: PropTypes.object,
};

export default UsersList;
