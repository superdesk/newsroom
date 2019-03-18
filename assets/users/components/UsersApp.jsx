import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext } from 'utils';
import {
    newUser,
    setQuery,
    fetchUsers,
} from '../actions';
import Users from './Users';
import ListBar from 'components/ListBar';


class UsersApp extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            [<ListBar
                key="UserBar"
                onNewItem={this.props.newUser}
                setQuery={this.props.setQuery}
                fetch={this.props.fetchUsers}
                buttonName={gettext('User')}
            />,
            <Users key="Users" />
            ]
        );
    }
}

UsersApp.propTypes = {
    users: PropTypes.arrayOf(PropTypes.object),
    userToEdit: PropTypes.object,
    activeUserId: PropTypes.string,
    selectUser: PropTypes.func,
    editUser: PropTypes.func,
    saveUser: PropTypes.func,
    deleteUser: PropTypes.func,
    newUser: PropTypes.func,
    resetPassword: PropTypes.func,
    cancelEdit: PropTypes.func,
    isLoading: PropTypes.bool,
    activeQuery: PropTypes.string,
    totalUsers: PropTypes.number,
    companies: PropTypes.arrayOf(PropTypes.object),
    companiesById: PropTypes.object,
    usersById: PropTypes.object,
    fetchUsers: PropTypes.func,
    setQuery: PropTypes.func,
    errors: PropTypes.object,
    dispatch: PropTypes.func,
};

const mapDispatchToProps = {
    newUser,
    fetchUsers,
    setQuery,
};

export default connect(null, mapDispatchToProps)(UsersApp);
